import { Readable } from 'stream'
import MimeNode = require('nodemailer/lib/mime-node')
import mimeFuncs = require('nodemailer/lib/mime-funcs')
import {
  isNullOrUndefined,
  signingOptions,
  encryptionOptions,
  isSMime
} from '../Helpers'
import { AS2MimeNodeOptions } from './Interfaces'
import { AS2Headers } from '../Interfaces'
import {
  AS2Crypto,
  SigningOptions,
  EncryptionOptions,
  DecryptionOptions,
  VerificationOptions
} from '../AS2Crypto'
import { hostname } from 'os'

export interface AS2MimeNode {
  keepBcc: boolean
  _headers: Array<{
    key: string
    value: string
  }>
  filename: string
  date: Date
  boundaryPrefix: string
  content: string | Buffer | Readable
  contentType: string
  rootNode: AS2MimeNode
  parentNode?: AS2MimeNode
  childNodes: AS2MimeNode[]
  raw: string
  normalizeHeaderKey: Function
  _handleContentType(structured: any): void
  _encodeWords(value: string): string
  _encodeHeaderValue(key: string, value: string): string
}

export class AS2MimeNode extends MimeNode {
  constructor (options: AS2MimeNodeOptions) {
    const {
      filename,
      content,
      baseBoundary,
      boundaryPrefix,
      contentType,
      contentDisposition,
      messageId,
      headers,
      sign,
      encrypt
    } = options

    super(contentType, { filename, baseBoundary })

    this.boundaryPrefix = boundaryPrefix || '--LibAs2'

    if (!isNullOrUndefined(content)) this.setContent(content)
    if (!isNullOrUndefined(headers)) this.setHeader(headers)
    if (!isNullOrUndefined(sign)) this.setSigning(sign)
    if (!isNullOrUndefined(encrypt)) this.setEncryption(encrypt)
    if (!isNullOrUndefined(messageId)) this.setHeader('Message-ID', messageId)
    this.setHeader(
      'Content-Disposition',
      isNullOrUndefined(contentDisposition) ? 'attachment' : contentDisposition
    )
    this.signed = contentType.toLowerCase().startsWith('multipart/signed')
    this.encrypted = contentType.toLowerCase().startsWith('multipart/encrypted')
    this.smime = isSMime(contentType)
    this.compressed = false
    if (this.smime) {
      let applicationType: string

      // Check for actual smime-type
      for (let part of contentType.split(/;/gu)) {
        let [key, value] = part.trim().split(/=/gu)
        key = key.trim().toLowerCase()

        if (key === 'smime-type') {
          this.smimeType = value.trim().toLowerCase()
        }

        if (key.startsWith('application/')) {
          applicationType = key
        }
      }

      // Infer smime-type
      if (this.smimeType === undefined || this.smimeType === '') {
        if (applicationType.endsWith('signature')) {
          this.smimeType = 'signed-data'
        } else {
          this.smimeType = 'not-available'
        }
      }

      if ((this.smimeType = 'signed-data')) this.signed = true
      if ((this.smimeType = 'enveloped-data')) this.encrypted = true
      if ((this.smimeType = 'compressed-data')) this.compressed = true
    }
  }

  private _sign: SigningOptions
  private _encrypt: EncryptionOptions
  smime: boolean
  signed: boolean
  encrypted: boolean
  compressed: boolean
  smimeType: string

  setSigning (options: SigningOptions): void {
    this._sign = signingOptions(options)
  }

  setEncryption (options: EncryptionOptions): void {
    this._encrypt = encryptionOptions(options)
  }

  setHeader (keyOrHeaders: any, value?: any): this {
    return super.setHeader(keyOrHeaders, value)
  }

  getHeaders (asObject: boolean = false): AS2Headers {
    let transferEncoding = this.getTransferEncoding()
    let headers: AS2Headers = asObject ? {} : []

    if (transferEncoding) {
      this.setHeader('Content-Transfer-Encoding', transferEncoding)
    }

    if (this.filename && !this.getHeader('Content-Disposition')) {
      this.setHeader('Content-Disposition', 'attachment')
    }

    // Ensure mandatory header fields
    if (this.rootNode === this) {
      if (!this.getHeader('Date')) {
        this.setHeader('Date', this.date.toUTCString().replace(/GMT/, '+0000'))
      }

      // ensure that Message-Id is present
      this.messageId()

      if (!this.getHeader('MIME-Version')) {
        this.setHeader('MIME-Version', '1.0')
      }
    }

    this._headers.forEach(header => {
      let key = header.key
      let value = header.value
      let structured
      let param
      let options: any = {}
      let formattedHeaders = [
        'From',
        'Sender',
        'To',
        'Cc',
        'Bcc',
        'Reply-To',
        'Date',
        'References'
      ]

      if (
        value &&
        typeof value === 'object' &&
        !formattedHeaders.includes(key)
      ) {
        Object.keys(value).forEach(key => {
          if (key !== 'value') {
            options[key] = value[key]
          }
        })
        value = ((value as any).value || '').toString()
        if (!value.trim()) {
          return
        }
      }

      if (options.prepared) {
        if (asObject) {
          headers[key] = value
        } else {
          ;(headers as any[]).push({ key, value })
        }

        return
      }

      switch (header.key) {
        case 'Content-Disposition':
          structured = mimeFuncs.parseHeaderValue(value)
          if (this.filename) {
            structured.params.filename = this.filename
          }
          value = mimeFuncs.buildHeaderValue(structured)
          break
        case 'Content-Type':
          structured = mimeFuncs.parseHeaderValue(value)

          this._handleContentType(structured)

          if (
            structured.value.match(/^text\/plain\b/) &&
            typeof this.content === 'string' &&
            /[\u0080-\uFFFF]/.test(this.content)
          ) {
            structured.params.charset = 'utf-8'
          }

          value = mimeFuncs.buildHeaderValue(structured)

          if (this.filename) {
            // add support for non-compliant clients like QQ webmail
            // we can't build the value with buildHeaderValue as the value is non standard and
            // would be converted to parameter continuation encoding that we do not want
            param = this._encodeWords(this.filename)

            if (
              param !== this.filename ||
              /[\s'"\\;:/=(),<>@[\]?]|^-/.test(param)
            ) {
              // include value in quotes if needed
              param = '"' + param + '"'
            }
            value += '; name=' + param
          }
          break
        case 'Bcc':
          if (!this.keepBcc) {
            // skip BCC values
            return
          }
          break
      }

      value = this._encodeHeaderValue(key, value)

      // skip empty lines
      if (!(value || '').toString().trim()) {
        return
      }

      if (typeof this.normalizeHeaderKey === 'function') {
        let normalized = this.normalizeHeaderKey(key, value)
        if (normalized && typeof normalized === 'string' && normalized.length) {
          key = normalized
        }
      }

      if (asObject) {
        headers[key] = value
      } else {
        ;(headers as any[]).push({ key, value })
      }
    })

    return headers
  }

  async sign (options?: SigningOptions): Promise<AS2MimeNode> {
    options = isNullOrUndefined(options) ? this._sign : options

    return AS2Crypto.sign(this, options)
  }

  async verify (options: VerificationOptions): Promise<AS2MimeNode> {
    return AS2Crypto.verify(this, options)
  }

  async decrypt (options: DecryptionOptions): Promise<AS2MimeNode> {
    return AS2Crypto.decrypt(this, options)
  }

  async encrypt (options?: EncryptionOptions): Promise<AS2MimeNode> {
    options = isNullOrUndefined(options) ? this._encrypt : options

    return AS2Crypto.encrypt(this, options)
  }

  async build (): Promise<Buffer> {
    if (!isNullOrUndefined(this._sign) && !isNullOrUndefined(this._encrypt)) {
      const signed = await this.sign(this._sign)
      const encrypted = await signed.encrypt(this._encrypt)

      return await encrypted.build()
    }

    if (!isNullOrUndefined(this._sign)) {
      const signed = await this.sign(this._sign)

      return await signed.build()
    }

    if (!isNullOrUndefined(this._encrypt)) {
      const encrypted = await this.encrypt(this._encrypt)

      return await encrypted.build()
    }

    return await super.build()
  }

  static generateMessageId (uniqueId?: string, sender?: string): string {
    uniqueId = isNullOrUndefined(uniqueId)
      ? AS2Crypto.generateUniqueId()
      : uniqueId
    sender = isNullOrUndefined(uniqueId) ? hostname() || 'localhost' : sender

    return '<' + uniqueId + '@' + sender + '>'
  }
}
