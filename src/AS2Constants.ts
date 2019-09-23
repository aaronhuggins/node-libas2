// STRINGS
export const CONTROL_CHAR = '\r\n'
export const MIME_VERSION = '1.0'
export const SMIME_DESC = 'This is an S/MIME signed message'
export const SIGNATURE_FILENAME = 'smime.p7s'
export const ENCRYPTION_FILENAME = 'smime.p7m'

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
  BINARY: 'binary' as AS2Encoding,
  BASE64: 'base64' as AS2Encoding
}

export const CRYPTO_ALGORITHM = {
  SHA1: 'sha1' as AS2Algorithm,
  SHA256: 'sha256' as AS2Algorithm
}

export const MIC_ALGORITHM = {
  SHA1: 'sha1',
  SHA256: 'sha-256'
}

// TYPES
export type AS2Encoding = '8bit' | 'binary' | 'base64'

export type AS2Algorithm = 'sha1' | 'sha256'

export type MimeType =
'text/plain' |
'application/edi-x12' |
'application/EDI-X12' |
'application/edifact' |
'application/EDIFACT' |
'application/edi-consent' |
'application/EDI-Consent' |
'application/pkcs7-signature' |
'application/pkcs7-mime' |
'application/x-pkcs7-signature' |
'application/x-pkcs7-mime' |
'application/xml' |
'application/XML' |
'message/disposition-notification' |
'multipart/mixed' |
'multipart/report' |
'multipart/signed'

export interface MimeHeaders {
  'Message-ID'?: string
  'message-id'?: string
  'MIME-Version'?: '1.0'
  'mime-version'?: '1.0'
  'Content-Type'?: string
  'content-type'?: string
  'Content-Disposition'?: string
  'content-disposition'?: string
  'Content-Transfer-Encoding'?: '8bit' | 'binary' | 'base64'
  'content-transfer-encoding'?: '8bit' | 'binary' | 'base64'
}
