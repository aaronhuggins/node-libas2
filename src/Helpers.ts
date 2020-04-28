import { AgreementOptions } from './AS2Composer'
import { SIGNING, ENCRYPTION } from './Constants'
import { AS2MimeNode } from './AS2MimeNode'
import { SigningOptions, EncryptionOptions } from './AS2Crypto'

/** Convenience method for null-checks */
export const isNullOrUndefined = function isNullOrUndefined (
  value: any
): boolean {
  return value === undefined || value === null
}

/** Transforms a payload into a canonical text format before signing */
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

/** Normalizes certificate signing options. */
export const signingOptions = function signingOptions (
  sign: SigningOptions
): SigningOptions {
  return { cert: '', key: '', chain: [], micalg: SIGNING.SHA256, ...sign }
}

/** Normalizes encryption options. */
export const encryptionOptions = function encryptionOptions (
  encrypt: EncryptionOptions
): EncryptionOptions {
  return { cert: '', encryption: ENCRYPTION._3DES, ...encrypt }
}

/** Normalizes agreement options. */
export const agreementOptions = function agreementOptions (
  agreement: AgreementOptions
): AgreementOptions {
  const { mdn } = agreement
  const { sign } = mdn

  return {
    version: '1.0',
    ...agreement,
    mdn: isNullOrUndefined(mdn)
      ? mdn
      : {
          ...mdn,
          sign: isNullOrUndefined(sign)
            ? sign
            : {
                importance: 'required',
                protocol: 'pkcs7-signature',
                ...sign
              }
        }
  }
}
