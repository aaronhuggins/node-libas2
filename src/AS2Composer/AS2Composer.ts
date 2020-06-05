import {
  AS2ComposerOptions,
  AgreementOptions,
  MessageDispositionOptions
} from './Interfaces'
import { AS2MimeNodeOptions, AS2MimeNode } from '../AS2MimeNode'
import {
  isNullOrUndefined,
  agreementOptions,
  parseHeaderString
} from '../Helpers'
import { AS2Headers, RequestOptions } from '../Interfaces'
import { STANDARD_HEADER } from '../Constants'

/** Class for composing AS2 messages. */
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

  setAgreement (agreement: AgreementOptions): void {
    this._agreement = agreementOptions(agreement)
  }

  setHeaders (headers: AS2Headers | AgreementOptions) {
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

  async toRequestOptions (url: string): Promise<RequestOptions> {
    if (this.message === undefined) {
      await this.compile()
    }
    const buffer = await this.message.build()
    const [headers, ...body] = buffer
      .toString('utf8')
      .split(/(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu)

    return {
      url,
      headers: parseHeaderString(headers),
      body: body.join('').trimLeft(),
      method: 'POST'
    }
  }
}
