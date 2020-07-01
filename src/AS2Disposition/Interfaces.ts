import { AgreementOptions } from '../AS2Composer'
import { AS2MimeNode } from '../AS2MimeNode'
import { AS2DispositionNotification } from './AS2DispositionNotification'

export interface AS2DispositionOptions {
  explanation: string
  notification: AS2DispositionNotification
  returned?: AS2MimeNode | boolean
}

export interface OutgoingDispositionOptions {
  /** The mime node to verify and/or decrypt; used construct the outgoing disposition. */
  node: AS2MimeNode
  /** The partner agreement to use when sending the outgoing disposition. */
  agreement: AgreementOptions
  /** Whether to attach the mime node to the disposition as the returned payload. */
  returnNode?: boolean
}
