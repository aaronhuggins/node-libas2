import { AS2Signing } from '../AS2Crypto'
import { LIBRAY_NAME_VERSION, CRLF } from '../Constants'
import { hostname } from 'os'

export class AS2DispositionNotification {
  constructor (notification?: AS2DispositionNotification) {
    Object.assign(this, notification, {
      headers: Array.isArray(notification.headers)
        ? Object.assign({}, ...notification.headers)
        : notification.headers
    })

    if (!this.reportingUa) {
      this.reportingUa = hostname() + '; ' + LIBRAY_NAME_VERSION
    }

    if (!this.originalRecipient) {
      this.originalRecipient = this.finalRecipient
    }
  }

  // Per RFC-4130, only the final recipient and disposition are required.
  reportingUa?: string
  mdnGateway?: string
  originalRecipient?:
    | string
    | {
        value: string
        type: string
      }
  originalMessageId?: string
  // Received-Content-MIC is required if the receipt is a signed receipt.
  receivedContentMic?: {
    mic: string
    algorithm: AS2Signing
  }
  headers?: { [key: string]: string }
  finalRecipient:
    | string
    | {
        value: string
        type: string
      }
  disposition: {
    type: 'manual-action' | 'automatic-action'
    processed: boolean
    description?: {
      type: 'error' | 'warning' | 'failure'
      text: string
    }
  }

  toNotification? (): { [key: string]: string } {
    const result = {}

    for (const [key, value] of Object.entries(this.headers || {})) {
      result[key] = value
    }

    result['Reporting-UA'] = this.reportingUa

    if (this.mdnGateway) result['MDN-Gateway'] = this.mdnGateway

    result['Original-Recipient'] =
      typeof this.originalRecipient === 'string'
        ? 'rfc822; ' + this.originalRecipient
        : this.originalRecipient.type + '; ' + this.originalRecipient.value

    result['Final-Recipient'] =
      typeof this.finalRecipient === 'string'
        ? 'rfc822; ' + this.finalRecipient
        : this.finalRecipient.type + '; ' + this.finalRecipient.value

    if (this.originalMessageId)
      result['Original-Message-ID'] = this.originalMessageId

    result['Disposition'] =
      this.disposition.type +
      '/' +
      (this.disposition.type === 'automatic-action'
        ? 'MDN-sent-automatically'
        : 'MDN-sent-manually') +
      '; ' +
      (this.disposition.processed ? 'processed' : 'failed') +
      (this.disposition.description
        ? '/' +
          this.disposition.description.type +
          '=' +
          this.disposition.description.text
        : '')

    if (this.receivedContentMic) {
      result['Received-Content-MIC'] =
        this.receivedContentMic.mic + ', ' + this.receivedContentMic.algorithm
    }

    return result
  }

  toString? () {
    const notification = this.toNotification()
    const result = []

    for (const [key, value] of Object.entries(notification)) {
      result.push(key + ': ' + value)
    }

    return result.join(CRLF) + CRLF
  }
}
