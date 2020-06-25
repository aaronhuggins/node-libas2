import { isNullOrUndefined } from '../Helpers'

type PemFileType = 'UNKNOWN' | 'PRIVATE_KEY' | 'PUBLIC_KEY' | 'CERTIFICATE'

/**
 * Takes  a DER-encoded PEM format file as a buffer or string and outputs an object with the inferred type and BER data.
 * @param {Buffer|string} bufferOrString - The data of the PEM-encoded file.
 * @property {string} type - The type of PEM file; one of PRIVATE_KEY, PUBLIC_KEY, CERTIFICATE, or UNKNOWN
 * @property {ArrayBuffer} data - The data of the DER-encoded PEM as a BER array buffer.
 */
export class PemFile {
  constructor (data: Buffer | string) {
    this.type = 'UNKNOWN'
    if (isNullOrUndefined(data) || data === '') return

    if (Buffer.isBuffer(data)) {
      data = data.toString('utf8')
    }

    const lines = data.split('\n')
    let contents = ''

    if (lines[0].toLowerCase().includes('private key')) this.type = 'PRIVATE_KEY'
    if (lines[0].toLowerCase().includes('public key')) this.type = 'PUBLIC_KEY'
    if (lines[0].toLowerCase().includes('certificate')) this.type = 'CERTIFICATE'

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

  static fromDer (data: Buffer, type: PemFileType = 'UNKNOWN'): PemFile {
    const pemFile = new PemFile('')

    pemFile.data = new Uint8Array(data).buffer

    if (PEM_FILETYPE[type]) {
      pemFile.type = type
    }

    return pemFile
  }
}

export const PEM_FILETYPE: { [key: string]: PemFileType } = {
  CERTIFICATE: 'CERTIFICATE',
  PRIVATE_KEY: 'PRIVATE_KEY',
  PUBLIC_KEY: 'PUBLIC_KEY'
}
