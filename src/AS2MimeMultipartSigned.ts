import * as AS2Constants from './AS2Constants'
import { AS2MimeMultipart } from './AS2MimeMultipart'
import { AS2MimePart } from './AS2MimePart'
import { AS2Crypto } from './AS2Crypto'
import uuidv4 = require('uuid/v4')

export class AS2MimeMultipartSigned extends AS2MimeMultipart {
  constructor (
    content: AS2MimePart,
    {
      publicCert,
      algorithm = AS2Constants.SIGNING.SHA256,
      attachHeaders = true,
      attachMessageId = true
    }: AS2MimeMultipartSignedOptions,
    privateKey?: string
  ) {
    super([content], { attachHeaders, attachMessageId })
    this._publicCert = publicCert
    this._algorithm = algorithm
    this._micalg = AS2Constants.MICALG[algorithm.toUpperCase()]
    this._setHeaders()

    if (typeof privateKey === 'string') {
      this.sign(privateKey)
    }
  }

  protected _publicCert: string
  protected _algorithm: AS2Constants.AS2Signing
  protected _micalg: string
  protected _signed: boolean = false
  protected Constants = {
    MULTIPART_TYPE: AS2Constants.MULTIPART_TYPE.SIGNED,
    CONTROL_CHAR: AS2Constants.CONTROL_CHAR,
    PROTOCOL_TYPE: AS2Constants.PROTOCOL_TYPE.PKCS7
  }

  isSigned (): boolean {
    return this._signed
  }

  sign (privateKey: string): void {
    if (this._content.length > 1 && !this._signed) {
      throw new Error(
        `Cannot sign more than one message/attachment. Number of messages/attachments: ${this._content.length}`
      )
    }

    const as2Crypto = new AS2Crypto()
    const mime = this._content[0]
    const signature = as2Crypto.sign(
      mime.toString(),
      this._publicCert,
      privateKey,
      this._algorithm
    )
    const mimeSignature = new AS2MimePart(signature, {
      mimeType: this.Constants.PROTOCOL_TYPE,
      name: AS2Constants.SIGNATURE_FILENAME,
      headers: {
        'Content-Disposition': `attachment; filename="${AS2Constants.SIGNATURE_FILENAME}"`
      },
      encoding: AS2Constants.ENCODING.BASE64
    })

    this._content[1] = mimeSignature
    this._signed = true
  }

  toString (attachHeaders?: boolean | string, privateKey?: string): string {
    if (typeof attachHeaders === 'string') {
      privateKey = `${attachHeaders}`
      attachHeaders = this._attachHeaders
    }

    if (attachHeaders === undefined) {
      attachHeaders = this._attachHeaders
    }

    if (privateKey === undefined) {
      if (!this._signed) {
        throw new Error(
          'Message not signed.\nPlease sign before returning string or else provide a private key as the second parameter of toString()'
        )
      }
    } else {
      this.sign(privateKey)
    }

    return super.toString(attachHeaders)
  }

  protected _writeHeaders (multipart: string[], attachHeaders?: boolean): void {
    if (this._attachHeaders || attachHeaders) {
      Object.keys(this._headers).forEach(header => {
        if (
          Object.prototype.hasOwnProperty.call(this._headers, header) as boolean
        ) {
          multipart.push(`${header}: ${this._headers[header]}`)
        }
      })
      multipart.push('')
    }

    multipart.push(AS2Constants.SMIME_DESC)
    multipart.push('')
  }

  protected _setHeaders (): void {
    this._headers = {
      'MIME-Version': AS2Constants.MIME_VERSION,
      'Content-Type': `${this.Constants.MULTIPART_TYPE}; protocol="${this.Constants.PROTOCOL_TYPE}"; micalg="${this._micalg}"; boundary="${this._boundary}"`
    }

    if (this._attachMessageId) {
      this._headers['Message-ID'] = `<${uuidv4()
        .replace(/-/gu, '')
        .toUpperCase()}@libas2.node>`
    }
  }
}

export interface AS2MimeMultipartSignedOptions {
  publicCert: string
  algorithm?: AS2Constants.AS2Signing
  attachHeaders?: boolean
  attachMessageId?: boolean
}
