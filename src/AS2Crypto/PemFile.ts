import { isNullOrUndefined } from '../Helpers'

/** Types of PEM files.
 * @typedef {'UNKNOWN'|'PRIVATE_KEY'|'PUBLIC_KEY'|'CERTIFICATE'} PemFileType
 */

type PemFileType = 'UNKNOWN' | 'PRIVATE_KEY' | 'PUBLIC_KEY' | 'CERTIFICATE'

/** Method for constructing an object from PEM data.
 * @param {string|Buffer|PemFile} data - Data for constructing a PemFile object.
 */
export class PemFile {
  constructor (data: string | Buffer | PemFile) {
    if (isNullOrUndefined(data) || data === '') return
    if (data instanceof PemFile) return data
    this.type = 'UNKNOWN'

    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8')
    }

    const lines = data.split('\n')
    let contents = ''

    if (lines[0].toLowerCase().includes('private key')) {
      this.type = 'PRIVATE_KEY'
    }
    if (lines[0].toLowerCase().includes('public key')) {
      this.type = 'PUBLIC_KEY'
    }
    if (lines[0].toLowerCase().includes('certificate')) {
      this.type = 'CERTIFICATE'
    }

    for (let line of lines) {
      line = line.trim()
      if (line.length > 0 && !line.toLowerCase().includes('-begin') && !line.toLowerCase().includes('-end')) {
        contents += line + '\r\n'
      }
    }

    this.data = new Uint8Array(Buffer.from(contents, 'base64')).buffer
  }

  type: PemFileType
  data: ArrayBuffer

  /** Convenience method for creating a PemFile from a DER/BER Buffer.
   * @param {Buffer} data - DER or BER data in a Buffer.
   * @param {PemFileType} [type='UNKNOWN'] - The type of PEM file.
   * @returns {PemFile} The data as a PemFile object.
   */
  static fromDer (data: Buffer, type: PemFileType = 'UNKNOWN'): PemFile {
    const pemFile = new PemFile('')

    pemFile.data = new Uint8Array(data).buffer

    if (PEM_FILETYPE[type]) {
      pemFile.type = type
    }

    return pemFile
  }
}

/** Constants used in libas2.
 * @namespace PEM_FILETYPE
 */
export const PEM_FILETYPE: {
  CERTIFICATE: PemFileType
  PRIVATE_KEY: PemFileType
  PUBLIC_KEY: PemFileType
} = {
  /**
   * @constant
   * @type {PemFileType}
   * @default
   */
  CERTIFICATE: 'CERTIFICATE',
  /**
   * @constant
   * @type {PemFileType}
   * @default
   */
  PRIVATE_KEY: 'PRIVATE_KEY',
  /**
   * @constant
   * @type {PemFileType}
   * @default
   */
  PUBLIC_KEY: 'PUBLIC_KEY'
}
