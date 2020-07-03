import { AS2MimeNodeOptions } from '../AS2MimeNode'
import { AS2Encryption, AS2Signing, PemFile } from '../AS2Crypto'
import { AS2Headers } from '../Interfaces'

export type PartnerFileType = 'EDIX12' | 'EDIFACT' | 'XML'

export interface AS2ComposerOptions {
  /** Message options */
  message: AS2MimeNodeOptions
  /** Agreement options */
  agreement: AgreementOptions
  /** Additional headers */
  additionalHeaders?: AS2Headers
}

export interface AgreementOptions {
  host: {
    role?: 'host'
    /** The name of the host. */
    name: string
    /** The id of the host; usually a company's DUNS id. */
    id: string
    /** The URL of the host's AS2 endpoint. */
    url: string | URL
    /** The certificate of the host in PEM format. Required for signing or decrypting. */
    certificate?: string | Buffer | PemFile
    /** The private key of the host in PEM format. Required for signing or decrypting. */
    privateKey?: string | Buffer | PemFile
    /** Host requires partner to encrypt messages sent to the host. */
    decrypt?: boolean
    /** Host requires partner to verify messages sent from the host. */
    sign?: AS2Signing | boolean
    /** Host requests a message disposition notification (MDN). */
    mdn?: {
      /** Host requires MDN to be sent to their URL. */
      async?: boolean
      /** Host requires MDN to be signed with algorithm if possible. */
      signing: AS2Signing | false
    }
  }
  partner: {
    role?: 'partner'
    /** The name of the partner. */
    name: string
    /** The id of the partner; usually a company's DUNS id. */
    id: string
    /** The URL of the partner's AS2 endpoint. */
    url: string | URL
    /** The file protocol for trading with the partner. */
    file?: PartnerFileType | string
    /** The certificate of the partner in PEM format. Required for signing or decrypting. */
    certificate?: string | Buffer | PemFile
    /** Partner requires host to encrypt messages sent to the partner. */
    encrypt?: AS2Encryption | boolean
    /** Partner requires host to verify messages sent from the partner. */
    verify?: boolean
    /** Partner may request a message disposition notification (MDN). */
    mdn?: {
      /** Partner requires MDN to be sent to their URL. */
      async?: boolean
      /** Partner requires MDN to be signed with algorithm if possible. */
      signing: AS2Signing | false
    }
  }
}
