import * as AS2Constants from './AS2Constants'
import { AS2MimePart } from './AS2MimePart'
import { AS2MimeMultipart } from './AS2MimeMultipart'
import { AS2MimeMultipartSigned } from './AS2MimeMultipartSigned'
import { AS2Crypto } from './AS2Crypto'

export class AS2MimeEncrypted extends AS2MimePart {
  constructor (mime: AS2MimeMultipartSigned | AS2MimeMultipart, publicCert: string, mimeType: AS2Constants.MimeType = 'application/x-pkcs7-mime') {
    super(
      mime.toString(true),
      true,
      mimeType,
      AS2Constants.ENCRYPTION_FILENAME,
      {
        'MIME-Version': AS2Constants.MIME_VERSION,
        'Content-Disposition': `attachment; filename="${AS2Constants.ENCRYPTION_FILENAME}"`,
        'Content-Type': `${mimeType}; smime-type=enveloped-data`
      },
      AS2Constants.ENCODING.BASE64
    )
    this._publicCert = publicCert
    this._encrypt()
  }

  protected _publicCert: string
  protected _encrypted: boolean = false

  public getMime (): string {
    return `${super.getMime()}\r\n`
  }

  public toString (): string {
    return this.getMime()
  }

  private _encrypt (): void {
    if (!this._encrypted) {
      const as2Crypto = new AS2Crypto()
      const data = this._data
      const encryptedData = as2Crypto.encrypt(data as string, this._publicCert)

      this._data = encryptedData
      this._encrypted = true
    }
  }
}
