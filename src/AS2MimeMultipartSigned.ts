import { AS2MimeMultipart } from './AS2MimeMultipart'
import { AS2MimeSection } from './AS2MimeSection'
import { AS2Crypto } from './AS2Crypto'

export class AS2MimeMultipartSigned extends AS2MimeMultipart {
  constructor (mime: AS2MimeSection, publicCert: string, privateKey: string, algorithm: 'sha1' | 'sha256' = 'sha1', useHeaders: boolean = true) {
    super([mime], useHeaders)
    this._publicCert = publicCert
    this._privateKey = privateKey
    this._algorithm = algorithm
    this._setHeaders()
    this._signMime()
  }

  protected _publicCert: string
  protected _privateKey: string
  protected _algorithm: 'sha1' | 'sha256'
  protected _signed: boolean = false
  protected Constants = {
    MULTIPART_TYPE: 'multipart/signed',
    CONTROL_CHAR: '\r\n',
    PROTOCOL_TYPE: 'application/x-pkcs7-signature'
  }

  protected _signMime (): void {
    if (this._mime.length > 1 && !this._signed) {
      throw new Error(`Cannot sign more than one message/attachment. Number of messages/attachments: ${this._mime.length}`)
    }

    if (!this._signed) {
      const as2Crypto = new AS2Crypto()
      const mime = this._mime[0]
      const signature = as2Crypto.sign(mime.getMime(), this._publicCert, this._privateKey, this._algorithm)
      const mimeSignature = new AS2MimeSection(
        signature,
        'application/x-pkcs7-signature',
        'smime.p7s',
        { 'Content-Disposition': 'attachment; filename="smime.p7s"' },
        'base64'
      )

      this._mime.push(mimeSignature)
      this._signed = true
    }
  }

  protected _writeHeaders (multipart: string[]): void {
    if (this._useHeaders) {
      Object.keys(this._headers).forEach((header) => {
        if (Object.prototype.hasOwnProperty.call(this._headers, header) as boolean) {
          multipart.push(`${header}: ${this._headers[header]}`)
        }
      })
      multipart.push('')
    }

    multipart.push('This is an S/MIME signed message')
    multipart.push('')
  }

  protected _setHeaders (): void {
    const algorithm: string = this._algorithm === 'sha256'
      ? 'sha-256'
      : 'sha1'

    this._headers = {
      'MIME-Version': '1.0',
      'Content-Type': `${this.Constants.MULTIPART_TYPE}; protocol="${this.Constants.PROTOCOL_TYPE}"; micalg="${algorithm}"; boundary="${this._boundary}"`
    }
  }
}
