import { AS2Encryption, AS2Signing } from './AS2Crypto'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

export const getPackageJson = function getPackageJson (filename?: string, index: number = 0): any {
  filename = filename === undefined ? module.filename : filename
  let pkg

  try {
    pkg = JSON.parse(readFileSync(resolve(dirname(filename), 'package.json'), 'utf8'))
  } catch (err) {}

  if (pkg) {
    return pkg
  } else if (index < 4) {
    return getPackageJson(dirname(filename), index + 1)
  }

  return {}
}

const { alternateName, version } = getPackageJson()

/** Constants used in libas2.
 * @namespace AS2Constants
 */
export const AS2Constants = {
  /** Constants used for signing.
   * @namespace AS2Constants.ENCRYPTION
   */
  ENCRYPTION: {
    /**
     * @constant
     * @type {AS2Encryption}
     * @default
     */
    AES128_CBC: 'aes128-CBC',
    /**
     * @constant
     * @type {AS2Encryption}
     * @default
     */
    AES192_CBC: 'aes192-CBC',
    /**
     * @constant
     * @type {AS2Encryption}
     * @default
     */
    AES256_CBC: 'aes256-CBC',
    /**
     * @constant
     * @type {AS2Encryption}
     * @default
     */
    AES128_GCM: 'aes128-GCM',
    /**
     * @constant
     * @type {AS2Encryption}
     * @default
     */
    AES192_GCM: 'aes192-GCM',
    /**
     * @constant
     * @type {AS2Encryption}
     * @default
     */
    AES256_GCM: 'aes256-GCM'
  } as {
    AES128_CBC: AS2Encryption
    AES192_CBC: AS2Encryption
    AES256_CBC: AS2Encryption
    AES128_GCM: AS2Encryption
    AES192_GCM: AS2Encryption
    AES256_GCM: AS2Encryption
  },
  /** Constants used for signing.
   * @namespace AS2Constants.ERROR
   */
  ERROR: {
    /**
     * @constant
     * @type {string}
     * @default
     */
    MISSING_PARTNER_CERT: 'Certificate is required for this partner agreement.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    MISSING_PARTNER_KEY: 'Private key is required for this partner agreement.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    WRONG_PEM_FILE: 'The type of pem file provided was not correct;',
    /**
     * @constant
     * @type {string}
     * @default
     */
    FINAL_RECIPIENT_MISSING:
      'AS2 message is missing the AS2-To header, so there is no final recipient which is required.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    CONTENT_VERIFY: 'Could not verify signature against contents.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    CERT_DECRYPT: 'Certificate provided was not used to encrypt message.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    DISPOSITION_NODE: 'Mime node must be provided in order to create outgoing disposition.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    NOT_IMPLEMENTED: 'NOT YET IMPLEMENTED!'
  },
  /** Constants used for signing.
   * @namespace AS2Constants.EXPLANATION
   */
  EXPLANATION: {
    /**
     * @constant
     * @type {string}
     * @default
     */
    SUCCESS:
      'The message was received successfully. This is no guarantee that the message contents have been processed.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    FAILED_DECRYPTION: 'The message was received, but could not be decrypted; the contents cannot be processed.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    FAILED_VERIFICATION:
      'The message was received, but could not be verified; the contents cannot be trusted to be the same contents that were sent.',
    /**
     * @constant
     * @type {string}
     * @default
     */
    FAILED_GENERALLY: 'The message could not be received or processed.'
  },
  /** Constants used for signing.
   * @namespace AS2Constants.SIGNING
   */
  SIGNING: {
    /**
     * @constant
     * @type {AS2Signing}
     * @default
     */
    SHA1: 'sha-1',
    /**
     * @constant
     * @type {AS2Signing}
     * @default
     */
    SHA256: 'sha-256',
    /**
     * @constant
     * @type {AS2Signing}
     * @default
     */
    SHA384: 'sha-384',
    /**
     * @constant
     * @type {AS2Signing}
     * @default
     */
    SHA512: 'sha-512'
  } as {
    SHA1: AS2Signing
    SHA256: AS2Signing
    SHA384: AS2Signing
    SHA512: AS2Signing
  },
  /** Constants used for signing.
   * @namespace AS2Constants.STANDARD_HEADER
   */
  STANDARD_HEADER: {
    /**
     * @constant
     * @type {string}
     * @default
     */
    VERSION: 'AS2-Version',
    /**
     * @constant
     * @type {string}
     * @default
     */
    TO: 'AS2-To',
    /**
     * @constant
     * @type {string}
     * @default
     */
    FROM: 'AS2-From',
    /**
     * @constant
     * @type {string}
     * @default
     */
    MDN_TO: 'Disposition-Notification-To',
    /**
     * @constant
     * @type {string}
     * @default
     */
    MDN_OPTIONS: 'Disposition-Notification-Options',
    /**
     * @constant
     * @type {string}
     * @default
     */
    MDN_URL: 'Receipt-Delivery-Option'
  },
  /**
   * @constant
   * @type {string}
   * @default
   */
  CRLF: '\r\n',
  /**
   * @constant
   * @type {string}
   * @default
   */
  MIME_VERSION: '1.0',
  /**
   * @constant
   * @type {string}
   * @default
   */
  AS2_VERSION: '1.0',
  /**
   * @constant
   * @type {string}
   * @default
   */
  SMIME_DESC: 'This is an S/MIME signed message',
  /**
   * @constant
   * @type {string}
   * @default
   */
  SIGNATURE_FILENAME: 'smime.p7s',
  /**
   * @constant
   * @type {string}
   * @default
   */
  ENCRYPTION_FILENAME: 'smime.p7m',
  /**
   * @constant
   * @type {string}
   * @default
   */
  LIBRARY_NAME: alternateName,
  /**
   * @constant
   * @type {string}
   * @default
   */
  LIBRARY_VERSION: version,
  /**
   * @constant
   * @type {string}
   * @default
   */
  LIBRAY_NAME_VERSION: alternateName + ' ' + version
}

// Make namespace of constants immutable.
Object.seal(AS2Constants.ENCRYPTION)
Object.seal(AS2Constants.ERROR)
Object.seal(AS2Constants.EXPLANATION)
Object.seal(AS2Constants.SIGNING)
Object.seal(AS2Constants.STANDARD_HEADER)
Object.seal(AS2Constants)
