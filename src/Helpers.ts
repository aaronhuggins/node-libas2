import { SIGNING, ENCRYPTION } from './AS2Constants'
import { AS2MimeNode, SigningOptions, EncryptionOptions } from './AS2MimNode'

export const isNullOrUndefined = function isNullOrUndefined (
  value: any
): boolean {
  return value === undefined || value === null
}

export const canonicalTransform = function canonicalTransform (
  node: AS2MimeNode
): void {
  const newline = /\r\n|\r|\n/g

  if (
    node.getHeader('content-type').slice(0, 5) === 'text/' &&
    !isNullOrUndefined(node.content)
  ) {
    node.content = (node.content as string).replace(newline, '\r\n')
  }

  node.childNodes.forEach(canonicalTransform)
}

export const signingOptions = function signingOptions (
  sign: SigningOptions
): SigningOptions {
  return { cert: '', key: '', chain: [], micalg: SIGNING.SHA256, ...sign }
}

export const encryptionOptions = function encryptionOptions (
  encrypt: EncryptionOptions
): EncryptionOptions {
  return { cert: '', encryption: ENCRYPTION._3DES, ...encrypt }
}
