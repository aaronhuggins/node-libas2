import { AS2ComposerOptions, AgreementOptions } from './Interfaces'
import { AS2Agreement } from './AS2Agreement'
import { AS2MimeNodeOptions, AS2MimeNode } from '../AS2MimeNode'
import { getAgreementOptions } from '../Helpers'
import { AS2Headers, RequestOptions } from '../Interfaces'
import { AS2Constants } from '../Constants'

const { STANDARD_HEADER, AS2_VERSION } = AS2Constants

/** Options for composing an AS2 message.
 * @typedef {object} AS2ComposerOptions
 * @property {AS2MimeNodeOptions} message
 * @property {AgreementOptions} agreement
 */

/** Options for composing an AS2 message.
 * @typedef {object} AgreementOptions
 * @property {object} host - Options for the AS2 host.
 * @property {string} host.name - The name of the host.
 * @property {string} host.id - The id of the host; usually a company's DUNS id.
 * @property {string|URL} host.url - The URL of the host's AS2 endpoint.
 * @property {string|Buffer|PemFile} [host.certificate] - The certificate of the host in PEM format. Required for signing or decrypting.
 * @property {string|Buffer|PemFile} [host.privateKey] - The private key of the host in PEM format. Required for signing or decrypting.
 * @property {boolean} host.decrypt - Host requires partner to encrypt messages sent to the host.
 * @property {AS2Signing|boolean} host.sign - Host requires partner to verify messages sent from the host.
 * @property {object} [host.mdn] - Host requests a message disposition notification (MDN).
 * @property {boolean} host.mdn.async - Host requires MDN to be sent to a separate URL.
 * @property {AS2Signing|false} host.mdn.signing - Host requires MDN to be signed with algorithm if possible.
 * @property {object} partner - Options for the AS2 partner.
 * @property {string} partner.name - The name of the partner.
 * @property {string} partner.id - The id of the partner; usually a company's DUNS id.
 * @property {string|URL} partner.url - The URL of the partner's AS2 endpoint.
 * @property {'EDIX12'|'EDIFACT'|'XML'|string} partner.file - The file protocol for trading with the partner.
 * @property {string|Buffer|PemFile} [partner.certificate] - The certificate of the partner in PEM format. Required for signing or decrypting.
 * @property {AS2Encryption|boolean} partner.encrypt - Partner requires host to encrypt messages sent to the partner.
 * @property {boolean} partner.verify - Partner requires host to verify messages sent from the partner.
 * @property {object} [partner.mdn] - Partner may request a message disposition notification (MDN).
 * @property {boolean} partner.mdn.async - Partner requires MDN to be sent to a separate URL.
 * @property {AS2Signing|false} partner.mdn.signing - Partner requires MDN to be signed with algorithm if possible.
 */

/** Class for composing AS2 messages.
 * @param {AS2ComposerOptions} options - The options for composing AS2 messages.
 */
export class AS2Composer {
  constructor (options: AS2ComposerOptions) {
    this._message = { ...options.message }
    this._headers = []
    this.setAgreement(options.agreement)

    if (Array.isArray(options.additionalHeaders)) {
      this._headers.push(...options.additionalHeaders)
    } else {
      for (const [key, value] of Object.entries(options.additionalHeaders || {})) {
        this._headers.push({ key, value })
      }
    }
  }

  _agreement: AS2Agreement
  _message: AS2MimeNodeOptions
  _headers: AS2Headers
  message: AS2MimeNode

  /** Set the agreement for this composer instance.
   * @param {AgreementOptions} agreement
   */
  setAgreement (agreement: AgreementOptions): void {
    this._agreement = getAgreementOptions(agreement)
  }

  /** Compile the composed message into an instance of AS2MimeNode.
   * @returns {Promise<AS2MimeNode>} This composer instance as an AS2MimeNode.
   */
  async compile (): Promise<AS2MimeNode> {
    this.message = new AS2MimeNode({ ...this._message })

    if (this._agreement.host.sign) {
      this.message.setSigning({
        cert: this._agreement.host.certificate,
        key: this._agreement.host.privateKey,
        algorithm: this._agreement.host.sign
      })

      this.message = await this.message.sign()
    }

    if (this._agreement.partner.encrypt) {
      this.message.setEncryption({
        cert: this._agreement.partner.certificate,
        encryption: this._agreement.partner.encrypt
      })

      this.message = await this.message.encrypt()
    }

    // Set AS2 headers.
    this.message.setHeader([
      { key: STANDARD_HEADER.FROM, value: this._agreement.host.id },
      { key: STANDARD_HEADER.TO, value: this._agreement.partner.id },
      { key: STANDARD_HEADER.VERSION, value: AS2_VERSION }
    ])
    this.message.messageId(true)

    // Set MDN headers.
    if (this._agreement.host.mdn) {
      const mdn = this._agreement.host.mdn
      let options = 'signed-receipt-protocol=optional,pkcs7-signature; signed-receipt-micalg=optional,sha-256'

      if (mdn.signing) {
        options = `signed-receipt-protocol=required,pkcs7-signature; signed-receipt-micalg=required,${mdn.signing.toLowerCase()}`
      }

      this.message.setHeader(STANDARD_HEADER.MDN_TO, this._agreement.host.id)
      this.message.setHeader(STANDARD_HEADER.MDN_OPTIONS, options)

      if (mdn.async) {
        this.message.setHeader(STANDARD_HEADER.MDN_URL, this._agreement.host.url.toString())
      }
    }

    this.message.setHeader(this._headers)

    return this.message
  }

  /** Create a Node.js-compatible RequestOptions object from the composed message.
   * @param {string} [url] - Optional: The URL of the AS2 endpoint receiving this AS2 message; will use agreement partner url if not provided.
   * @returns {Promise<RequestOptions>} This composer instance as request options for Node.js.
   */
  async toRequestOptions (url?: string): Promise<RequestOptions> {
    if (this.message === undefined) {
      await this.compile()
    }
    const { headers, body } = await this.message.buildObject()

    return {
      url: url || this._agreement.partner.url,
      headers,
      body,
      method: 'POST'
    }
  }
}
