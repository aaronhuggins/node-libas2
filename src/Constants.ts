import { AS2Encryption, AS2MicAlgorithm, AS2Signing } from './AS2Crypto'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

/** Walk up the directory tree searching for this module's package.json. */
const getPackageJson = function getPackageJson (
  filename?: string,
  index: number = 0
): any {
  filename = filename === undefined ? module.filename : filename
  let pkg

  try {
    pkg = JSON.parse(
      readFileSync(resolve(dirname(filename), 'package.json'), 'utf8')
    )
  } catch (err) {}

  if (pkg) {
    return pkg
  } else if (index < 4) {
    return getPackageJson(dirname(filename), (index += 1))
  }

  return {}
}

const { alternateName, version } = getPackageJson()

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
export const SIGNING: {
  SHA1: AS2Signing
  SHA256: AS2Signing
  SHA384: AS2Signing
  SHA512: AS2Signing
} = {
  SHA1: 'sha-1',
  SHA256: 'sha-256',
  SHA384: 'sha-384',
  SHA512: 'sha-512'
}

export const MIC_ALGORITHM = {
  SHA1: 'sha1' as AS2MicAlgorithm,
  SHA256: 'sha-256' as AS2MicAlgorithm,
  SHA384: 'sha-384' as AS2MicAlgorithm,
  SHA512: 'sha-512' as AS2MicAlgorithm
}

export const ENCRYPTION: {
  AES128: AS2Encryption
  AES192: AS2Encryption
  AES256: AS2Encryption
} = {
  AES128: 'aes-128-CBC',
  AES192: 'aes-192-CBC',
  AES256: 'aes-256-CBC'
}

export const STANDARD_HEADER = {
  VERSION: 'AS2-Version',
  TO: 'AS2-To',
  FROM: 'AS2-From',
  MDN_TO: 'Disposition-Notification-To',
  MDN_OPTIONS: 'Disposition-Notification-Options',
  MDN_URL: 'Receipt-Delivery-Option'
}

export const EXPLANATION = {
  SUCCESS:
    'The message was received successfully. This is no guarantee that the message contents have been processed.',
  FAILED_DECRYPTION:
    'The message was received, but could not be decrypted; the contents cannot be processed.',
  FAILED_VERIFICATION:
    'The message was received, but could not be verified; the contents cannot be trusted to be the same contents that were sent.',
  FAILED_GENERALLY: 'The message could not be received or processed.'
}

export const ERROR = {
  FINAL_RECIPIENT_MISSING:
    'AS2 message is missing the AS2-To header, so there is no final recipient which is required.',
  CONTENT_VERIFY: 'Could not verify signature against contents.',
  CERT_DECRYPT: 'Certificate provided was not used to encrypt message.',
  DISPOSITION_NODE:
    'Mime node must be provided in order to create outgoing disposition.',
  NOT_IMPLEMENTED: 'NOT YET IMPLEMENTED!'
}
