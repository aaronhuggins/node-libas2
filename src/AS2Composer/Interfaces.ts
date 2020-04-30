import { AS2MimeNodeOptions } from '../AS2MimeNode'
import { AS2Headers } from '../Interfaces'
import { SigningOptions, EncryptionOptions, AS2Signing } from '../AS2Crypto'

export interface AS2ComposerOptions {
  /** Message options */
  message: AS2MimeNodeOptions
  /** Agreement options */
  agreement: AgreementOptions
}

export interface AgreementOptions {
  /** The sender of the AS2 message; usually a company's DUNS id. */
  sender: string
  /** the recipient of the AS2 message; usually a company's DUNS id. */
  recipient: string
  /** Options for signing the message; will override "sign" option in message. */
  sign?: SigningOptions
  /** Options for encrypting the message; will override "encrypt" option in message. */
  encrypt?: EncryptionOptions
  /** Settings for the request of a Message Disposition Notification; default is none. */
  mdn?: MessageDispositionOptions
  /** The version of AS2 agreed upon; default value is "1.0". */
  version?: string
  /** Additional headers for the agreement. */
  headers?: AS2Headers
}

export interface MessageDispositionOptions {
  /** Email address to receive a Message Disposition Notification. */
  to: string
  /** Url to receive an asynchronous Message Disposition Notification. */
  deliveryUrl?: string
  /** Request a signed Message Disposition Notification. */
  sign?: {
    importance: 'required' | 'optional'
    protocol: 'pkcs7-signature'
    micalg: AS2Signing
  }
}
