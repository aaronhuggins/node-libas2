import * as AS2Constants from './AS2Constants'
import { AS2MimePart } from './AS2MimePart'
import { AS2MimeMultipartSigned } from './AS2MimeMultipartSigned'
import { AS2MimeEncrypted } from './AS2MimeEncrypted'

export class AS2Message {
  constructor (
    content?: string | Uint8Array | Buffer,
    options?: AS2MessageOptions
  ) {
    this._content = content
    this._options = options
    if (content !== undefined && options !== undefined) {
      this._setMime()
      this._setHeaders()
    }
  }

  protected _content: string | Uint8Array | Buffer
  protected _mime: AS2MimePart | AS2MimeMultipartSigned | AS2MimeEncrypted
  protected _headers: AS2Constants.AS2Headers
  protected _options: AS2MessageOptions

  getHeaders (): AS2Constants.AS2Headers {
    return this._headers
  }

  getMessage (): any {
    return {
      headers: this._headers,
      body: this._mime.toString()
    }
  }

  toString (): string {
    const message: string[] = []

    Object.keys(this._headers).forEach(header => {
      if (
        Object.prototype.hasOwnProperty.call(this._headers, header) as boolean
      ) {
        message.push(`${header}: ${this._headers[header]}`)
      }
    })

    message.push('')
    message.push(this._mime.toString())

    return message.join(AS2Constants.CONTROL_CHAR)
  }

  protected _setMime (): void {
    if (
      this._options.algorithm === undefined &&
      this._options.encryption === undefined
    ) {
      this._options.message.attachMessageId = true
    }

    if (
      this._options.algorithm !== undefined ||
      this._options.encryption !== undefined
    ) {
      this._options.message.attachHeaders = true
    }

    const mime = new AS2MimePart(this._content, this._options.message)
    let smime: AS2MimeMultipartSigned
    let encrypted: AS2MimeEncrypted

    this._mime = mime

    if (this._options.algorithm !== undefined) {
      // Sign content
      smime = new AS2MimeMultipartSigned(
        mime,
        {
          publicCert: this._options.senderCert,
          algorithm: this._options.algorithm,
          attachMessageId: this._options.encryption === undefined
        },
        this._options.privateKey
      )

      this._mime = smime
    }

    if (this._options.encryption !== undefined) {
      // Encrypt content
      encrypted = new AS2MimeEncrypted(this._mime, {
        attachHeaders: false,
        publicCert: this._options.receiverCert,
        encryption: this._options.encryption
      })

      this._mime = encrypted
    }
  }

  protected _setHeaders (): void {
    this._headers = {}
    const optionHeaders =
      this._options.headers === undefined ? {} : this._options.headers
    const mimeHeaders = this._mime.getHeaders()

    switch (this._options.receipt) {
      case AS2Constants.RECEIPT.SEND:
        this._headers[
          'Disposition-Notification-To'
        ] = this._options.agreement.email
        if (this._options.agreement.asyncUrl !== undefined) {
          this._headers[
            'Receipt-Delivery-Option'
          ] = this._options.agreement.asyncUrl
        }
        break
      case AS2Constants.RECEIPT.SEND_SIGNED:
        this._headers[
          'Disposition-Notification-To'
        ] = this._options.agreement.email
        if (this._options.agreement.asyncUrl !== undefined) {
          this._headers[
            'Receipt-Delivery-Option'
          ] = this._options.agreement.asyncUrl
        }
        this._headers['Disposition-Notification-Options'] =
          'signed-receipt-protocol=required,pkcs7-signature; signed-receipt-micalg=required,sha1'
        break
    }

    Object.keys(optionHeaders).forEach(header => {
      if (
        (Object.prototype.hasOwnProperty.call(
          optionHeaders,
          header
        ) as boolean) &&
        !(Object.prototype.hasOwnProperty.call(mimeHeaders, header) as boolean)
      ) {
        this._headers[header] = optionHeaders[header]
      }
    })

    Object.keys(mimeHeaders).forEach(header => {
      if (
        Object.prototype.hasOwnProperty.call(mimeHeaders, header) as boolean
      ) {
        this._headers[header] = mimeHeaders[header]
      }
    })
  }
}

export interface AS2MessageOptions {
  receipt?: AS2Constants.AS2Receipt
  algorithm?: AS2Constants.AS2Signing
  senderCert?: string
  receiverCert?: string
  privateKey?: string
  encryption?: AS2Constants.AS2Encryption
  message?: {
    attachHeaders?: boolean
    attachMessageId?: boolean
    mimeType?: AS2Constants.MimeType
    name?: string
    headers?: AS2Constants.AS2Headers
    encoding?: AS2Constants.AS2Encoding
  }
  agreement: {
    as2From: string
    as2To: string
    email?: string
    asyncUrl?: string
  }
  headers?: AS2Constants.AS2Headers
}
