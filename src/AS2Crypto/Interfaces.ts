export type AS2Signing = 'sha1' | 'sha256' | 'sha384' | 'sha512'

export type AS2Encryption =
  | 'des-EDE3-CBC'
  | 'aes128-CBC'
  | 'aes192-CBC'
  | 'aes256-CBC'

export interface EncryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string
  /** A valid type of encryption. */
  encryption: AS2Encryption
}

export interface DecryptionOptions {
  /** PEM-based public certificate contents. */
  cert: string
  /** PEM-based private certificate contents. */
  key: string
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

export interface VerificationOptions {
  /** PEM-based public certificate contents. */
  cert: string
  /** Algorithm of secure signature hash to use. */
  micalg?: AS2Signing
}
