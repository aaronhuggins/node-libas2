import { Readable } from 'stream'
import { AS2Encryption, AS2Signing } from '../AS2Constants'
import { AS2Headers } from '../Interfaces'

export interface AS2MimeNodeOptions {
  /** Filename for the node. */
  filename?: string
  /** Content of the node. */
  content?: string | Buffer | Readable
  /** Shared part of the unique multipart boundary. */
  baseBoundary?: string
  /** Content type of the node; will be auto-calculated from the filename if not set. */
  contentType?: string
  /** The content disposition of the node. */
  contentDisposition?: 'inline' | 'attachment'
  /** Optional message ID; if not provided, one will be generated. */
  messageId?: string
  /** Additional headers for the node. */
  headers?: AS2Headers
  /** Options for signing the node. */
  sign?: SigningOptions
  /** Options for encrypting the node. */
  encrypt?: EncryptionOptions
}

export interface EncryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string
  /** A valid type of encryption. */
  encryption: AS2Encryption
}

export interface SigningOptions {
  /** PEM-based public certificate contents. */
  cert: string
  /** PEM-based private certificate contents. */
  key: string
  /** Array of PEM-based certificate chain contents. */
  chain?: string[]
  /** Algorithm of secure signature hash to use. */
  micalg?: AS2Signing
}
