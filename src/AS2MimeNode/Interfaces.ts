import { Readable } from 'stream'
import { AS2Headers } from '../Interfaces'
import { SigningOptions, EncryptionOptions } from '../AS2Crypto'

export interface AS2MimeNodeOptions {
  /** Filename for the node. */
  filename?: string
  /** Content of the node. */
  content?: string | Buffer | Readable
  /** Shared part of the unique multipart boundary. */
  baseBoundary?: string
  /** Prefix for the boundary; default is '--LibAs2_'. */
  boundaryPrefix?: false | string
  /** Content type of the node; will be auto-calculated from the filename if not set. */
  contentType?: string
  /** The content disposition of the node. */
  contentDisposition?: boolean | 'inline' | 'attachment'
  /** Optional message ID; if not provided, one will be generated. */
  messageId?: string
  /** Additional headers for the node. */
  headers?: AS2Headers
  /** Options for signing the node. */
  sign?: SigningOptions
  /** Options for encrypting the node. */
  encrypt?: EncryptionOptions
}
