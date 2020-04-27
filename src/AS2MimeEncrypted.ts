import * as AS2Constants from './AS2Constants'
import { AS2MimePart } from './AS2MimePart'
import { AS2MimeMultipart } from './AS2MimeMultipart'
import { AS2MimeMultipartSigned } from './AS2MimeMultipartSigned'
import { AS2Crypto } from './AS2Crypto'

export class AS2MimeEncrypted extends AS2MimePart {
  constructor (
    content: AS2MimeMultipartSigned | AS2MimeMultipart | AS2MimePart,
    {
      attachHeaders = true,
      publicCert,
      mimeType = 'application/x-pkcs7-mime',
      attachMessageId = true,
      encryption = AS2Constants.ENCRYPTION._3DES
    }: AS2MimeEncryptedOptions
  ) {
    super(content.toString(true), {
      attachHeaders,
      mimeType,
      name: AS2Constants.ENCRYPTION_FILENAME,
      headers: {
        'MIME-Version': AS2Constants.MIME_VERSION,
        'Content-Disposition': `attachment; filename="${AS2Constants.ENCRYPTION_FILENAME}"`,
        'Content-Type': `${mimeType}; smime-type=enveloped-data`
      },
      encoding: AS2Constants.ENCODING.BASE64,
      attachMessageId
    })
    this._publicCert = publicCert
    this._encryption = encryption
    this._encrypt()
  }

  protected _publicCert: string
  protected _encryption: AS2Constants.AS2Encryption
  protected _encrypted: boolean = false

  public toString (): string {
    return `${super.toString()}\r\n`
  }

  private _encrypt (): void {
    if (!this._encrypted) {
      const as2Crypto = new AS2Crypto()
      const data = this._content
      const encryptedData = as2Crypto.encrypt(
        data as string,
        this._publicCert,
        this._encryption
      )

      this._content = encryptedData
      this._encrypted = true
    }
  }
}

export interface AS2MimeEncryptedOptions {
  attachHeaders?: boolean
  mimeType?: AS2Constants.MimeType
  encryption?: AS2Constants.AS2Encryption
  attachMessageId?: boolean
  publicCert: string
}
