import { Readable } from 'stream'
import * as MimeNode from 'nodemailer/lib/mime-node'
import { AS2MimeNodeOptions, DispositionOutOptions } from './Interfaces'
import { isNullOrUndefined, getSigningOptions, getEncryptionOptions, isSMime, parseHeaderString } from '../Helpers'
import { AS2Crypto, SigningOptions, EncryptionOptions, DecryptionOptions, VerificationOptions } from '../AS2Crypto'
import { AS2Disposition } from '../AS2Disposition'
import { hostname } from 'os'

/** Options for constructing an AS2 message.
 * @typedef {object} AS2MimeNodeOptions
 * @property {string} [filename]
 * @property {string|Buffer | Readable} [content]
 * @property {string} [boundary]
 * @property {string} [baseBoundary]
 * @property {false|string} [boundaryPrefix='--LibAs2_']
 * @property {string} [contentType]
 * @property {boolean|'inline'|'attachment'} [contentDisposition]
 * @property {string} [messageId]
 * @property {AS2Headers} [headers]
 * @property {SigningOptions} [sign]
 * @property {EncryptionOptions} [encrypt]
 */

/** Convenience options for generating an outgoing MDN.
 * @typedef {object} DispositionOutOptions
 * @property {AgreementOptions} agreement
 * @property {boolean} [returnNode]
 */

export interface AS2MimeNode {
  keepBcc: boolean
  _headers: Array<{
    key: string
    value: string
  }>
  filename: string
  date: Date
  boundary: string
  boundaryPrefix: string
  content: string | Buffer | Readable
  contentType: string
  rootNode: AS2MimeNode
  parentNode?: AS2MimeNode
  childNodes: AS2MimeNode[]
  nodeCounter: number
  raw: string
  normalizeHeaderKey: Function
  _handleContentType(structured: any): void
  _encodeWords(value: string): string
  _encodeHeaderValue(key: string, value: string): string
}

/** Class for describing and constructing a MIME document.
 * @param {AS2MimeNodeOptions} options - Options for constructing an AS2 message.
 */
export class AS2MimeNode extends MimeNode {
  constructor (options: AS2MimeNodeOptions) {
    const {
      filename,
      content,
      boundary,
      baseBoundary,
      boundaryPrefix,
      contentType,
      contentDisposition,
      messageId,
      headers,
      sign,
      encrypt
    } = options

    super(contentType, {
      filename,
      baseBoundary: !isNullOrUndefined(boundaryPrefix) && isNullOrUndefined(boundary) ? baseBoundary : undefined
    })

    this.contentType = contentType
    this.boundaryPrefix =
      isNullOrUndefined(boundaryPrefix) && isNullOrUndefined(boundary)
        ? '--LibAs2'
        : boundaryPrefix === false || !isNullOrUndefined(boundary)
        ? ''
        : boundaryPrefix
    this.boundary = boundary

    if (!isNullOrUndefined(content)) this.setContent(content)
    if (!isNullOrUndefined(headers)) this.setHeader(headers)
    if (!isNullOrUndefined(sign)) this.setSigning(sign)
    if (!isNullOrUndefined(encrypt)) this.setEncryption(encrypt)
    if (!isNullOrUndefined(messageId)) this.setHeader('Message-ID', messageId)
    if (!isNullOrUndefined(contentDisposition) && contentDisposition !== false) {
      this.setHeader('Content-Disposition', contentDisposition === true ? 'attachment' : contentDisposition)
    }
    if (this.contentType) {
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

        if (this.smimeType === 'signed-data') this.signed = true
        if (this.smimeType === 'enveloped-data') this.encrypted = true
        if (this.smimeType === 'compressed-data') this.compressed = true
      }
    }

    this.parsed = false
  }

  private _sign: SigningOptions
  private _encrypt: EncryptionOptions
  parsed: boolean
  smime: boolean
  signed: boolean
  encrypted: boolean
  compressed: boolean
  smimeType: string

  /** Set the signing options for this instance.
   * @param {SigningOptions} options - Options for signing this AS2 message.
   */
  setSigning (options: SigningOptions): void {
    this._sign = getSigningOptions(options)
  }

  /** Set the encryption options for this instance.
   * @param {EncryptionOptions} options - Options for encrypting this AS2 message.
   */
  setEncryption (options: EncryptionOptions): void {
    this._encrypt = getEncryptionOptions(options)
  }

  /** Set one or more headers on this instance.
   * @param {string|any} keyOrHeaders - The key name of the header to set or an array of headers.
   * @param {string} [value] - The value of the header key; required if providing a simple key/value.
   * @returns {AS2MimeNode} This AS2MimeNode instance.
   */
  setHeader (keyOrHeaders: any, value?: any): this {
    super.setHeader(keyOrHeaders, value)

    return this
  }

  /** Sets and/or gets the message ID of the MIME message.
   * @param {boolean} [create=false] - Set the the message ID if one does not exist.
   * @returns {string} The message ID of the MIME.
   */
  messageId (create: boolean = false): string {
    let messageId = this.getHeader('Message-ID')

    // You really should define your own Message-Id field!
    if (!messageId && create) {
      messageId = AS2MimeNode.generateMessageId()

      this.setHeader('Message-ID', messageId)
    }

    return messageId
  }

  /** Convenience method for generating an outgoing MDN for this message.
   * @param {DispositionOutOptions} [options] - Optional options for generating an MDN.
   * @returns {Promise<object>} The content node and the outgoing MDN as an AS2MimeNode.
   */
  async dispositionOut (
    options?: DispositionOutOptions
  ): Promise<{
    contentNode: AS2MimeNode
    dispositionNode: AS2MimeNode
    disposition: AS2Disposition
  }> {
    options = isNullOrUndefined(options) ? ({} as any) : options

    return await AS2Disposition.outgoing({ ...options, node: this })
  }

  /** Convenience method for consuming this instance as an incoming MDN.
   * @param {VerificationOptions} [signed] - Pass verification options for a signed MDN.
   * @returns {Promise<AS2Disposition>} This instance as an incoming AS2Disposition.
   */
  async dispositionIn (signed?: VerificationOptions): Promise<AS2Disposition> {
    return await AS2Disposition.incoming(this, signed)
  }

  /** Convenience method for signing this instance.
   * @param {SigningOptions} [options] - Options for signing this AS2 message; not required if provided when constructing this instance.
   * @returns {Promise<AS2MimeNode>} This instance as a new signed multipart AS2MimeNode.
   */
  async sign (options?: SigningOptions): Promise<AS2MimeNode> {
    options = isNullOrUndefined(options) ? this._sign : options

    return AS2Crypto.sign(this, options)
  }

  /** Convenience method for verifying this instance.
   * @param {VerificationOptions} options - Options for verifying this signed AS2 message.
   * @returns {Promise<AS2MimeNode>} The content part of this signed message as an AS2MimeNode.
   */
  async verify (options: VerificationOptions): Promise<AS2MimeNode> {
    return (await AS2Crypto.verify(this, options)) ? this.childNodes[0] : undefined
  }

  /** Convenience method for decrypting this instance.
   * @param {DecryptionOptions} options - Options for decrypting this encrypted AS2 message.
   * @returns {Promise<AS2MimeNode>} The contents of the encrypted message as an AS2MimeNode.
   */
  async decrypt (options: DecryptionOptions): Promise<AS2MimeNode> {
    return AS2Crypto.decrypt(this, options)
  }

  /** Convenience method for encrypting this instance.
   * @param {EncryptionOptions} [options] - Options for encrypting this AS2 message; not required if provided when constructing this instance.
   * @returns {Promise<AS2MimeNode>} This instance as a new encrypted AS2MimeNode.
   */
  async encrypt (options?: EncryptionOptions): Promise<AS2MimeNode> {
    options = isNullOrUndefined(options) ? this._encrypt : options

    return AS2Crypto.encrypt(this, options)
  }

  /** Constructs a complete S/MIME or MIME buffer from this instance.
   * @returns {Promise<Buffer>} This instance as raw, complete S/MIME or MIME buffer.
   */
  async build (): Promise<Buffer> {
    if (this.parsed && this.raw !== undefined) return Buffer.from(this.raw)

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

  /** Method for getting the headers and body of the MIME message as separate properties.
   * @returns {Promise<object>} An object with headers and body properties.
   */
  async buildObject (): Promise<{
    headers: { [key: string]: any }
    body: string
  }> {
    const buffer = await this.build()
    const [headers, ...body] = buffer.toString('utf8').split(/(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu)

    return {
      headers: parseHeaderString(headers),
      body: body.join('').trimLeft()
    }
  }

  /** Generates a valid, formatted, random message ID.
   * @param {string} [sender='<HOST_NAME>'] - The sender of this ID.
   * @param {string} [uniqueId] - A unique ID may be provided if a real GUID is required.
   * @returns {string} A valid message ID for use with MIME.
   */
  static generateMessageId (sender?: string, uniqueId?: string): string {
    uniqueId = isNullOrUndefined(uniqueId) ? AS2Crypto.generateUniqueId() : uniqueId
    sender = isNullOrUndefined(sender) ? hostname() || 'localhost' : sender

    return '<' + uniqueId + '@' + sender + '>'
  }
}
