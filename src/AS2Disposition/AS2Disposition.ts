import { AS2MimeNode } from '../AS2MimeNode'
import { AS2DispositionOptions } from './Interfaces'
import { parseHeaderString } from '../Helpers'
import { AS2DispositionNotification } from './AS2DispositionNotification'

const getReportNode = function getReportNode (node: AS2MimeNode): AS2MimeNode {
  if (!node) return

  if (
    node.contentType.includes('multipart/report') &&
    node.contentType.includes('disposition-notification')
  ) {
    return node
  } else {
    for (const childNode of node.childNodes || []) {
      return getReportNode(childNode)
    }
  }
}

const toNotification = function toNotification (
  key: string,
  value: string
): [string, any] {
  let result: any = {}
  const parts = value.split(/;/gu).map(part => part.trim())
  const newKey = (str: string) =>
    str
      .toLowerCase()
      .split('-')
      .map((chars, index) =>
        index === 0
          ? chars.toLowerCase()
          : chars.charAt(0).toUpperCase() + chars.toLowerCase().substring(1)
      )
      .join('')

  switch (key.toLowerCase()) {
    case 'reporting-ua':
    case 'mdn-gateway':
    case 'original-message-id':
      result = value
      key = newKey(key)
      break
    case 'original-recipient':
    case 'final-recipient':
      result.value = parts.slice(1).join('; ')
      result.type = parts[0]
      key = newKey(key)
      break
    case 'disposition':
      const [type, action] = parts[0].split('/')

      result.value = action
      result.type = type

      for (const part of parts.slice(1)) {
        let index = part.indexOf('=')
        if (index === -1) index = part.length
        let key = part
          .slice(0, index)
          .trim()
          .toLowerCase()
        let value: any = part.slice(index + 1).trim()

        if (key.startsWith('processed') || key.startsWith('failed')) {
          let [attrKey, attrProp] = key.split('/')
          result.processed = attrKey === 'processed'

          if (attrProp !== undefined) {
            result.description = {
              type: attrProp.toLowerCase(),
              text: value
            }
          }

          continue
        }

        if (result.attributes === undefined) result.attributes = {}

        if (result.attributes[key] === undefined) {
          result.attributes[key] = value || true
        }
      }
      key = newKey(key)
      break
    case 'received-content-mic':
      const [micValue, micalg] = value.split(',').map(val => val.trim())
      result.mic = micValue
      result.algorithm = micalg.toLowerCase()
      key = newKey(key)
      break
    default:
      result[key] = value
      key = 'headers'
      break
  }

  return [key, result]
}

/** Class for describing and constructing a Message Disposition Notification. */
export class AS2Disposition {
  constructor (mdn?: AS2MimeNode | AS2DispositionOptions) {
    if (mdn instanceof AS2MimeNode) {
      // Always get the Message ID of the root node; enveloped MDNs may not have this value on child nodes.
      const messageId = mdn.messageId()

      // Travel mime node tree for content type multipart/report.
      mdn = getReportNode(mdn)

      // https://tools.ietf.org/html/rfc3462
      if (mdn) {
        this.messageId = messageId
        // Get the human-readable message, the first part of the report.
        this.explanation = mdn.childNodes[0].content.toString('utf8').trim()
        // Get the message/disposition-notification and parse, which is the second part.
        this.notification = new AS2DispositionNotification(
          parseHeaderString(
            mdn.childNodes[1].content.toString('utf8'),
            toNotification
          ) as any
        )
        // Get the optional thid part, if present; it is the returned message content.
        this.returned = mdn.childNodes[2]
      }
    } else {
      this.messageId = AS2MimeNode.generateMessageId()
      this.explanation = mdn.explanation
      this.notification =
        mdn.notification instanceof AS2DispositionNotification
          ? mdn.notification
          : new AS2DispositionNotification(mdn.notification)
      this.returned = mdn.returned
    }
  }

  messageId: string
  explanation: string
  notification: AS2DispositionNotification
  returned?: AS2MimeNode

  toMimeNode (): AS2MimeNode {
    const rootNode = new AS2MimeNode({
      contentType: 'multipart/report; report-type=disposition-notification',
      messageId: this.messageId
    })

    rootNode.appendChild(
      new AS2MimeNode({
        contentType: 'text/plain',
        content: this.explanation
      })
    )
    rootNode.appendChild(
      new AS2MimeNode({
        contentType: 'message/disposition-notification',
        content: this.notification.toString()
      })
    )
    if (this.returned) {
      rootNode.appendChild(this.returned)
    }

    return rootNode
  }
}
