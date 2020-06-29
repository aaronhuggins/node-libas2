export type AS2Signing = 'sha-1' | 'sha-256' | 'sha-384' | 'sha-512'

export type AS2Encryption = 'aes-128-CBC' | 'aes-192-CBC' | 'aes-256-CBC'

export interface EncryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer
  /** A valid type of encryption. */
  encryption: AS2Encryption
}

export interface DecryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer
  /** PEM-based private certificate contents. */
  key: string | Buffer
}

export interface SigningOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer
  /** PEM-based private certificate contents. */
  key: string | Buffer
  /** Algorithm of secure signature hash to use. */
  algorithm?: AS2Signing
}

export interface VerificationOptions {
  /** PEM-based public certificate contents. */
  cert: string | Buffer
}
