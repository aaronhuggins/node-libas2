import { AS2Encryption, AS2MicAlgorithm, AS2Signing } from './AS2Crypto'
import { alternateName, version } from '../package.json'

// ERRORS
export const NOT_IMPLEMENTED = new Error('NOT YET IMPLEMENTED.')

// STRINGS
export const CRLF = '\r\n'
export const MIME_VERSION = '1.0'
export const AS2_VERSION = '1.0'
export const SMIME_DESC = 'This is an S/MIME signed message'
export const SIGNATURE_FILENAME = 'smime.p7s'
export const ENCRYPTION_FILENAME = 'smime.p7m'
export const LIBRARY_NAME = alternateName
export const LIBRARY_VERSION = version
export const LIBRAY_NAME_VERSION = alternateName + ' ' + version

// NAMESPACES
export const SIGNING = {
  SHA1: 'sha1' as AS2Signing,
  SHA256: 'sha256' as AS2Signing,
  SHA384: 'sha384' as AS2Signing,
  SHA512: 'sha512' as AS2Signing
}

export const MIC_ALGORITHM = {
  SHA1: 'sha1' as AS2MicAlgorithm,
  SHA256: 'sha-256' as AS2MicAlgorithm,
  SHA384: 'sha-384' as AS2MicAlgorithm,
  SHA512: 'sha-512' as AS2MicAlgorithm
}

export const ENCRYPTION = {
  _3DES: 'des-EDE3-CBC' as AS2Encryption,
  AES128: 'aes128-CBC' as AS2Encryption,
  AES192: 'aes192-CBC' as AS2Encryption,
  AES256: 'aes256-CBC' as AS2Encryption,
  DES3: 'des-EDE3-CBC' as AS2Encryption
}

export const STANDARD_HEADER = {
  VERSION: 'AS2-Version',
  TO: 'AS2-To',
  FROM: 'AS2-From',
  MDN_TO: 'Disposition-Notification-To',
  MDN_OPTIONS: 'Disposition-Notification-Options',
  MDN_URL: 'Receipt-Delivery-Option'
}
