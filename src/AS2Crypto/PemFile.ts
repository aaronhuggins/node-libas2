import { isNullOrUndefined } from '../Helpers'

type PemFileType = 'UNKNOWN' | 'PRIVATE_KEY' | 'PUBLIC_KEY' | 'CERTIFICATE'

export class PemFile {
  constructor (data: Buffer | string) {
    if (isNullOrUndefined(data) || data === '') return
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
      if (
        line.length > 0 &&
        !line.toLowerCase().includes('-begin') &&
        !line.toLowerCase().includes('-end')
      ) {
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
