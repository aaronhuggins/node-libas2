import { AS2MimeNode } from "../AS2MimeNode";
import { AS2DispositionNotification } from "./Interfaces";
import { parseHeaderString } from "../Helpers";

export class AS2Disposition {
  constructor (mdn?: AS2MimeNode) {
    // Travel mime node tree for content type multipart/report.
    const getReport = function getReport (mdn: AS2MimeNode): AS2MimeNode {
      if (!mdn) return
      if (
        mdn.contentType.includes('multipart/report') &&
        mdn.contentType.includes('disposition-notification')
      ) {
        return mdn
      } else {
        for (const node of mdn.childNodes) {
          return getReport(node)
        }
      }
    }

    mdn = getReport(mdn)

    // https://tools.ietf.org/html/rfc3462
    if (mdn) {
      this.messageId = mdn.messageId()
      // Get the human-readable message, the first part of the report.
      this.explanation = mdn.childNodes[0].content.toString('utf8')
      // Get the message/disposition-notification and parse, which is the second part.
      this.notification = parseHeaderString(mdn.childNodes[1].content.toString('utf8'))
      // Get the optional thid part, if present; it is the returned message content.
      this.returned = mdn.childNodes[2]
    }
  }

  messageId: string
  explanation: string
  notification: AS2DispositionNotification
  returned?: AS2MimeNode
}
