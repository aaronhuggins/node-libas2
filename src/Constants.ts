import { AS2Encryption, AS2Signing } from './AS2Crypto'

export const NOT_IMPLEMENTED = new Error('NOT YET IMPLEMENTED.')

// STRINGS
export const CRLF = '\r\n'
export const MIME_VERSION = '1.0'
export const AS2_VERSION = '1.0'
export const SMIME_DESC = 'This is an S/MIME signed message'
export const SIGNATURE_FILENAME = 'smime.p7s'
export const ENCRYPTION_FILENAME = 'smime.p7m'
export const SIGNATURE_HEADER = `-----BEGIN PKCS7-----${CRLF}`
export const SIGNATURE_FOOTER = `-----END PKCS7-----${CRLF}`

// ENUMERABLES
export const GUARANTEED_TEXT = [
  'text/plain',
  'application/edi-x12',
  'application/EDI-X12',
  'application/edifact',
  'application/EDIFACT',
  'application/edi-consent',
  'application/EDI-Consent',
  'application/xml',
  'application/XML'
]

// NAMESPACES
export const MULTIPART_TYPE = {
  MIXED: 'multipart/mixed',
  SIGNED: 'multipart/signed',
  ENCRYPTED: 'multipart/encrypted'
}

export const PROTOCOL_TYPE = {
  PKCS7: 'application/x-pkcs7-signature' as MimeType
}

export const ENCODING = {
  _8BIT: '8bit' as AS2Encoding,
  BASE64: 'base64' as AS2Encoding,
  BINARY: 'binary' as AS2Encoding,
  BIT8: '8bit' as AS2Encoding
}

export const SIGNING = {
  SHA1: 'sha1' as AS2Signing,
  SHA256: 'sha256' as AS2Signing,
  SHA384: 'sha384' as AS2Signing,
  SHA512: 'sha512' as AS2Signing
}

export const MICALG = {
  SHA1: 'sha1',
  SHA256: 'sha-256',
  SHA384: 'sha-384',
  SHA512: 'sha-512'
}

export const ENCRYPTION = {
  _3DES: 'des-EDE3-CBC' as AS2Encryption,
  AES128: 'aes128-CBC' as AS2Encryption,
  AES192: 'aes192-CBC' as AS2Encryption,
  AES256: 'aes256-CBC' as AS2Encryption,
  DES3: 'des-EDE3-CBC' as AS2Encryption
}

export const RECEIPT = {
  NONE: 0 as AS2Receipt,
  SEND: 1 as AS2Receipt,
  SEND_SIGNED: 2 as AS2Receipt
}

export const STANDARD_HEADER = {
  VERSION: 'AS2-Version',
  TO: 'AS2-To',
  FROM: 'AS2-From',
  MDN_TO: 'Disposition-Notification-To',
  MDN_OPTIONS: 'Disposition-Notification-Options',
  MDN_URL: 'Receipt-Delivery-Option'
}

// TYPES
export type AS2Encoding = '8bit' | 'binary' | 'base64'

export type AS2Receipt = 0 | 1 | 2

export type MimeType =
  | 'text/plain'
  | 'application/edi-x12'
  | 'application/EDI-X12'
  | 'application/edifact'
  | 'application/EDIFACT'
  | 'application/edi-consent'
  | 'application/EDI-Consent'
  | 'application/pkcs7-signature'
  | 'application/pkcs7-mime'
  | 'application/x-pkcs7-signature'
  | 'application/x-pkcs7-mime'
  | 'application/xml'
  | 'application/XML'
  | 'message/disposition-notification'
  | 'multipart/mixed'
  | 'multipart/report'
  | 'multipart/signed'

export interface OldAS2Headers {
  'AS2-Version'?: '1.0'
  'as2-version'?: '1.0'
  'AS2-From'?: string
  'as2-from'?: string
  'AS2-To'?: string
  'as2-to'?: string
  'Content-Type'?: string
  'content-type'?: string
  'Content-Disposition'?: string
  'content-disposition'?: string
  'Content-Transfer-Encoding'?: '8bit' | 'binary' | 'base64'
  'content-transfer-encoding'?: '8bit' | 'binary' | 'base64'
  Date?: string
  date?: string
  'Disposition-Notification-Options'?: string
  'disposition-notification-options'?: string
  'Disposition-Notification-To'?: string
  'disposition-notification-to'?: string
  'Message-ID'?: string
  'message-id'?: string
  'MIME-Version'?: '1.0'
  'mime-version'?: '1.0'
  'Original-Message-Id'?: string
  'original-message-id'?: string
  'Receipt-Delivery-Option'?: string
  'receipt-delivery-option'?: string
  Subject?: string
  subject?: string
}
