import { AS2MimeNode } from '../AS2MimeNode'
import { AS2DispositionNotification } from './AS2DispositionNotification'
import {
  VerificationOptions,
  DecryptionOptions,
  SigningOptions
} from '../AS2Crypto'

export interface AS2DispositionOptions {
  explanation: string
  notification: AS2DispositionNotification
  returned?: AS2MimeNode | boolean
}

export interface OutgoingDispositionOptions {
  /** The mime node to verify and/or decrypt; used construct the outgoing disposition. */
  node: AS2MimeNode
  /** Whether to attach the mime node to the disposition as the returned payload. */
  returnNode?: boolean
  /** If the disposition should be signed, provide signing options. */
  signDisposition?: SigningOptions
  /** If the mime node was signed, provide verification options. */
  signed?: VerificationOptions
  /** If the mime node was encrypted, provide decryption options. */
  encrypted?: DecryptionOptions
}
