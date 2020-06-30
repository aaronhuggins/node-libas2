import {
  AS2ComposerOptions,
  AgreementOptions,
  MessageDispositionOptions
} from './Interfaces'
import { AS2MimeNodeOptions, AS2MimeNode } from '../AS2MimeNode'
import { isNullOrUndefined, agreementOptions } from '../Helpers'
import { AS2Headers, RequestOptions } from '../Interfaces'
import { AS2Constants } from '../Constants'

const { STANDARD_HEADER } = AS2Constants

/** Options for composing an AS2 message.
 * @typedef {object} AS2ComposerOptions
 * @property {AS2MimeNodeOptions} message
 * @property {AgreementOptions} agreement
 */

/** Options for composing an AS2 message.
 * @typedef {object} AgreementOptions
 * @property {string} sender
 * @property {string} recipient
 * @property {SigningOptions} sign
 * @property {EncryptionOptions} encrypt
 * @property {MessageDispositionOptions} mdn
 * @property {string} version
 * @property {AS2Headers} headers
 */

/** Options for composing an AS2 message.
 * @typedef {object} MessageDispositionOptions
 * @property {string} to
 * @property {string} [deliveryUrl]
 * @property {object} [sign]
 * @property {'required'|'optional'} sign.importance
 * @property {'pkcs7-signature'} sign.protocol
 * @property {AS2Signing} sign.micalg
 */

/** Class for composing AS2 messages.
 * @param {AS2ComposerOptions} options - The options for composing AS2 messages.
 */
export class AS2Composer {
  constructor (options: AS2ComposerOptions) {
    this._message = { ...options.message }
    this._headers = []
    this.setAgreement(options.agreement)
    this.setHeaders(this._agreement)
  }

  _agreement: AgreementOptions
  _message: AS2MimeNodeOptions
  _headers: Array<{
    key: string
    value: string
  }>
  message: AS2MimeNode

  /** Set the agreement for this composer instance.
   * @param {AgreementOptions} agreement
   */
  setAgreement (agreement: AgreementOptions): void {
    this._agreement = agreementOptions(agreement)
  }

  /** Set headers for this composer instance.
   * @param {AS2Headers|AgreementOptions} headers
   */
  setHeaders (headers: AS2Headers | AgreementOptions): void {
    if (
      !isNullOrUndefined((headers as AgreementOptions).sender) &&
      !isNullOrUndefined((headers as AgreementOptions).recipient)
    ) {
      const result: Array<{
        key: string
        value: string
      }> = []

      for (let entry of Object.entries(headers)) {
        const [key, value] = entry

        switch (key) {
          case 'sender':
            result.push({ key: STANDARD_HEADER.FROM, value })
            break
          case 'recipient':
            result.push({ key: STANDARD_HEADER.TO, value })
            break
          case 'version':
            result.push({ key: STANDARD_HEADER.VERSION, value })
            break
          case 'mdn':
            const mdn = (value as unknown) as MessageDispositionOptions

            result.push({ key: STANDARD_HEADER.MDN_TO, value: mdn.to })

            if (!isNullOrUndefined(mdn.sign)) {
              const sign = mdn.sign
              result.push({
                key: STANDARD_HEADER.MDN_OPTIONS,
                value: `signed-receipt-protocol=${sign.importance},${sign.protocol}; signed-receipt-micalg=${sign.importance},${sign.micalg}`
              })
            }
            if (!isNullOrUndefined(mdn.deliveryUrl)) {
              result.push({
                key: STANDARD_HEADER.MDN_URL,
                value: mdn.deliveryUrl
              })
            }
            break
          case 'headers':
            this.setHeaders((value as unknown) as AS2Headers)
            break
        }
      }

      this._headers = this._headers.concat(result)
    } else {
      if (Array.isArray(headers)) {
        this._headers = this._headers.concat(headers as any)
      } else {
        for (let entry of Object.entries(headers)) {
          for (let [key, value] of entry) {
            this._headers.push({ key, value })
          }
        }
      }
    }
  }

  /** Compile the composed message into an instance of AS2MimeNode.
   * @returns {Promise<AS2MimeNode>} This composer instance as an AS2MimeNode.
   */
  async compile (): Promise<AS2MimeNode> {
    this.message = new AS2MimeNode({ ...this._message })
    if (!isNullOrUndefined(this._agreement.sign)) {
      this.message.setSigning(this._agreement.sign)
    }
    if (!isNullOrUndefined(this._agreement.encrypt)) {
      this.message.setEncryption(this._agreement.encrypt)
    }
    if (
      !isNullOrUndefined(this._agreement.sign) ||
      !isNullOrUndefined(this._message.sign)
    ) {
      this.message = await this.message.sign()
    }
    if (
      !isNullOrUndefined(this._agreement.encrypt) ||
      !isNullOrUndefined(this._message.encrypt)
    ) {
      this.message = await this.message.encrypt()
    }

    this.message.setHeader(this._headers)

    return this.message
  }

  /** Create a Node.js-compatible RequestOptions object from the composed message.
   * @param {string} url - The URL of the AS2 endpoint receiving this AS2 message.
   * @returns {Promise<RequestOptions>} This composer instance as request options for Node.js.
   */
  async toRequestOptions (url: string): Promise<RequestOptions> {
    if (this.message === undefined) {
      await this.compile()
    }
    const { headers, body } = await this.message.buildObject()

    return {
      url,
      headers,
      body,
      method: 'POST'
    }
  }
}
