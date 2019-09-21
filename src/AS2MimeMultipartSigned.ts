import * as AS2Constants from './AS2Constants'
import { AS2MimeMultipart } from './AS2MimeMultipart'
import { AS2MimePart } from './AS2MimePart'
import { AS2Crypto } from './AS2Crypto'

export class AS2MimeMultipartSigned extends AS2MimeMultipart {
  constructor (mime: AS2MimePart, publicCert: string, privateKey: string, algorithm: AS2Constants.AS2Algorithm = AS2Constants.CRYPTO_ALGORITHM.SHA1, attachHeaders: boolean = true) {
    super([mime], attachHeaders)
    this._publicCert = publicCert
    this._privateKey = privateKey
    this._algorithm = algorithm
    this._setHeaders()
    this._signMime()
  }

  protected _publicCert: string
  protected _privateKey: string
  protected _algorithm: AS2Constants.AS2Algorithm
  protected _signed: boolean = false
  protected Constants = {
    MULTIPART_TYPE: AS2Constants.MULTIPART_TYPE.SIGNED,
    CONTROL_CHAR: AS2Constants.CONTROL_CHAR,
    PROTOCOL_TYPE: AS2Constants.PROTOCOL_TYPE.PKCS7
  }

  protected _signMime (): void {
    if (this._mime.length > 1 && !this._signed) {
      throw new Error(`Cannot sign more than one message/attachment. Number of messages/attachments: ${this._mime.length}`)
    }

    if (!this._signed) {
      const as2Crypto = new AS2Crypto()
      const mime = this._mime[0]
      const signature = as2Crypto.sign(mime.getMime(), this._publicCert, this._privateKey, this._algorithm)
      const mimeSignature = new AS2MimePart(
        signature,
        true,
        this.Constants.PROTOCOL_TYPE,
        AS2Constants.SIGNATURE_FILENAME,
        { 'Content-Disposition': `attachment; filename="${AS2Constants.SIGNATURE_FILENAME}"` },
        AS2Constants.ENCODING.BASE64
      )

      this._mime.push(mimeSignature)
      this._signed = true
    }
  }

  protected _writeHeaders (multipart: string[]): void {
    if (this._attachHeaders) {
      Object.keys(this._headers).forEach((header) => {
        if (Object.prototype.hasOwnProperty.call(this._headers, header) as boolean) {
          multipart.push(`${header}: ${this._headers[header]}`)
        }
      })
      multipart.push('')
    }

    multipart.push(AS2Constants.SMIME_DESC)
    multipart.push('')
  }

  protected _setHeaders (): void {
    const algorithm: string = this._algorithm === AS2Constants.CRYPTO_ALGORITHM.SHA256
      ? AS2Constants.MIC_ALGORITHM.SHA256
      : AS2Constants.MIC_ALGORITHM.SHA1

    this._headers = {
      'MIME-Version': AS2Constants.MIME_VERSION,
      'Content-Type': `${this.Constants.MULTIPART_TYPE}; protocol="${this.Constants.PROTOCOL_TYPE}"; micalg="${algorithm}"; boundary="${this._boundary}"`
    }
  }
}
