import { PemFile } from './PemFile'

export type AS2Signing = 'sha-1' | 'sha-256' | 'sha-384' | 'sha-512'

export type AS2Encryption =
  | 'des-EDE3-CBC'
  | 'aes128-CBC'
  | 'aes192-CBC'
  | 'aes256-CBC'
  | 'aes128-GCM'
  | 'aes192-GCM'
  | 'aes256-GCM'

export interface EncryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer | PemFile
  /** A valid type of encryption. */
  encryption: AS2Encryption
}

export interface DecryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer | PemFile
  /** PEM-based private certificate contents. */
  key: string | Buffer | PemFile
}

export interface SigningOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer | PemFile
  /** PEM-based private certificate contents. */
  key: string | Buffer | PemFile
  /** Algorithm of secure signature hash to use. */
  algorithm?: AS2Signing
}

export interface VerificationOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer | PemFile
}
