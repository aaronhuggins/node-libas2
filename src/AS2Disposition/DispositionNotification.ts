import { AS2Signing } from '../AS2Crypto'
import { AS2DispositionNotification } from './Interfaces'
import { LIBRAY_NAME_VERSION, CRLF } from '../Constants'
import { hostname } from 'os'

export class DispositionNotification {
  constructor (notification ?: DispositionNotification) {
    Object.assign(this, notification)
  }

  // Per RFC-4130, only the final recipient and disposition are required.
  reportingUa?: string
  mdnGateway?: string
  originalRecipient?: string
  originalMessageId?: string
  receivedcontentMic?: {
    mic: string,
    algorithm: AS2Signing
  }
  headers?: { [key: string]: string }
  finalRecipient: string
  disposition: {
    type: 'manual-action' | 'automatic-action'
    processed: boolean
    description?: {
      type: 'error' | 'warning' | 'failure'
      text: string
    }
  }

  toNotification (): AS2DispositionNotification {
    const result = {}

    for (const [key, value] of Object.entries(this.headers || {})) {
      result[key] = value
    }

    if (this.reportingUa) {
      result['Reporting-UA'] = this.reportingUa
    } else {
      result['Reporting-UA'] = hostname() + '; ' + LIBRAY_NAME_VERSION
    }

    if (this.mdnGateway) result['MDN-Gateway'] = this.mdnGateway

    if (this.originalRecipient) {
      result['Original-Recipient'] = 'rfc822' + '; ' + this.originalRecipient
    } else {
      result['Original-Recipient'] = 'rfc822' + '; ' + this.finalRecipient
    }

    result['Final-Recipient'] = 'rfc822' + '; ' + this.finalRecipient

    if (this.originalMessageId) result['Original-Message-ID'] = this.originalMessageId

    result['Disposition'] = this.disposition.type +
      '/' + (this.disposition.type === 'automatic-action' ? 'MDN-sent-automatically' : 'MDN-sent-manually') +
      '; ' + (this.disposition.processed ? 'processed' : 'failed') +
      (this.disposition.description ? '/' + this.disposition.description.type + '=' + this.disposition.description.text : '')

    if (this.receivedcontentMic) {
      result['Received-Content-MIC'] = this.receivedcontentMic
    }

    return result
  }

  toString() {
    const notification = this.toNotification()
    const result = []

    for (const [key, value] of Object.entries(notification)) {
      result.push(key + ': ' + value)
    }

    return result.join(CRLF) + CRLF
  }
}
