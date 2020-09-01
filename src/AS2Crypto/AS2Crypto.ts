import { AS2Constants } from '../Constants'
import { AS2MimeNode } from '../AS2MimeNode'
import { getEncryptionOptions, canonicalTransform } from '../Helpers'
import * as MimeNode from 'nodemailer/lib/mime-node'
import { EncryptionOptions, SigningOptions, DecryptionOptions, VerificationOptions } from './Interfaces'
import { AS2Parser } from '../AS2Parser'
import { randomBytes } from 'crypto'
import { AS2SignedData } from './AS2SignedData'
import { AS2EnvelopedData } from './AS2EnvelopedData'

const { CRLF, ENCRYPTION_FILENAME, SIGNATURE_FILENAME, ERROR } = AS2Constants

/** List of supported signing algorithms.
 * @typedef {'sha-1'|'sha-256'|'sha-384'|'sha-512'} AS2Signing
 */

/** List of supported encryption algorithms.
 * @typedef {'des-EDE3-CBC'|'aes128-CBC'|'aes192-CBC'|'aes256-CBC'|'aes128-GCM'|'aes192-GCM'|'aes256-GCM'} AS2Encryption
 */

/** Options for encrypting payloads.
 * @typedef {object} EncryptionOptions
 * @property {string|Buffer} cert
 * @property {AS2Encryption} encryption
 */

/** Options for decrypting payloads.
 * @typedef {object} DecryptionOptions
 * @property {string|Buffer} cert
 * @property {string|Buffer} key
 */

/** Options for decrypting payloads.
 * @typedef {object} SigningOptions
 * @property {string|Buffer} cert
 * @property {string|Buffer} key
 * @property {AS2Signing} algorithm
 */

/** Options for decrypting payloads.
 * @typedef {object} VerificationOptions
 * @property {string|Buffer} cert
 */

/** Class for cryptography methods supported by AS2. */
export class AS2Crypto {
  private static async buildNode (node: AS2MimeNode): Promise<Buffer> {
    return node.parsed ? await node.build() : await MimeNode.prototype.build.bind(node)()
  }

  /** A fix for signing with Nodemailer to produce verifiable SMIME;
   * the library joins multipart boundaries without the part's trailing CRLF,
   * where OpenSSL and other SMIME clients keep each part's last CRLF.
   * @private
   */
  private static removeTrailingCrLf (buffer: Buffer): Buffer {
    const trailingBytes = buffer.slice(buffer.length - 2, buffer.length)

    return trailingBytes.toString('utf8') === CRLF ? buffer.slice(0, buffer.length - 2) : buffer
  }

  /** Crux to generate UUID-like random strings
   * @returns {string} A UUID-like random string.
   */
  static generateUniqueId (): string {
    const byteLengths = [4, 2, 2, 2, 6]

    return byteLengths.map(byteLength => randomBytes(byteLength).toString('hex')).join('-')
  }

  /** Method to decrypt an AS2MimeNode from a PKCS7 encrypted AS2MimeNode.
   * @param {AS2MimeNode} node - The AS2MimeNode to decrypt.
   * @param {DecryptionOptions} options - Options to decrypt the MIME message.
   * @returns {Promise<AS2MimeNode>} The decrypted MIME as an AS2MimeNode.
   */
  static async decrypt (node: AS2MimeNode, options: DecryptionOptions): Promise<AS2MimeNode> {
    const data: Buffer = Buffer.isBuffer(node.content) ? node.content : Buffer.from(node.content as string, 'base64')
    const envelopedData = new AS2EnvelopedData(data, true)
    const buffer = await envelopedData.decrypt(options.cert, options.key)
    const revivedNode = await AS2Parser.parse(buffer)

    return revivedNode
  }

  /** Method to envelope an AS2MimeNode in an encrypted AS2MimeNode.
   * @param {AS2MimeNode} node - The AS2MimeNode to encrypt.
   * @param {EncryptionOptions} options - Options to encrypt the MIME message.
   * @returns {Promise<AS2MimeNode>} The encrypted MIME as an AS2MimeNode.
   */
  static async encrypt (node: AS2MimeNode, options: EncryptionOptions): Promise<AS2MimeNode> {
    options = getEncryptionOptions(options)
    const rootNode = new AS2MimeNode({
      filename: ENCRYPTION_FILENAME,
      contentType: 'application/pkcs7-mime; smime-type=enveloped-data'
    })

    canonicalTransform(node)

    const buffer = await AS2Crypto.buildNode(node)
    const envelopedData = new AS2EnvelopedData(buffer)
    const derBuffer = await envelopedData.encrypt(options.cert, options.encryption)

    rootNode.setContent(derBuffer)

    return rootNode
  }

  /** Method to verify data has not been modified from a signature.
   * @param {AS2MimeNode} node - The AS2MimeNode to verify.
   * @param {VerificationOptions} options - Options to verify the MIME message.
   * @param {boolean} [getDigest] - Optional argument to return a message digest if verified instead of a boolean.
   * @returns {Promise<boolean|object>} A boolean or digest object indicating if the message was verified.
   */
  static async verify (node: AS2MimeNode, options: VerificationOptions): Promise<boolean>
  static async verify (
    node: AS2MimeNode,
    options: VerificationOptions,
    getDigest: true
  ): Promise<{
    digest: Buffer
    algorithm: string
  }>
  static async verify (
    node: AS2MimeNode,
    options: VerificationOptions,
    getDigest?: boolean
  ): Promise<
    | boolean
    | {
        digest: Buffer
        algorithm: string
      }
  > {
    const contentPart = await AS2Crypto.buildNode(node.childNodes[0])
    const contentPartNoCrLf = AS2Crypto.removeTrailingCrLf(contentPart)
    const signaturePart = Buffer.isBuffer(node.childNodes[1].content)
      ? node.childNodes[1].content
      : Buffer.from(node.childNodes[1].content as string, 'base64')
    const signedData = new AS2SignedData(contentPart, signaturePart)

    // Deal with Nodemailer trailing CRLF bug by trying with and without CRLF
    if (await signedData.verify(options.cert)) {
      return getDigest ? signedData.getMessageDigest() : true
    }

    const signedDataNoCrLf = new AS2SignedData(contentPartNoCrLf, signaturePart)
    const result = await signedDataNoCrLf.verify(options.cert)

    return getDigest && result ? signedDataNoCrLf.getMessageDigest() : result
  }

  /** Method to sign data against a certificate and key pair.
   * @param {AS2MimeNode} node - The AS2MimeNode to sign.
   * @param {EncryptionOptions} options - Options to sign the MIME message.
   * @returns {Promise<AS2MimeNode>} The signed MIME as a multipart AS2MimeNode.
   */
  static async sign (node: AS2MimeNode, options: SigningOptions): Promise<AS2MimeNode> {
    const rootNode = new AS2MimeNode({
      contentType: `multipart/signed; protocol="application/pkcs7-signature"; micalg=${options.algorithm};`,
      encrypt: (node as any)._encrypt
    })
    const contentNode = rootNode.appendChild(node) as AS2MimeNode
    const contentHeaders: Array<{
      key: string
      value: string
    }> = (contentNode as any)._headers

    for (let i = 0, len = contentHeaders.length; i < len; i++) {
      const header = contentHeaders[i]

      if (header.key.toLowerCase() === 'content-type') continue

      rootNode.setHeader(header.key, header.value)
      contentHeaders.splice(i, 1)
      i--
      len--
    }

    canonicalTransform(contentNode)

    const canonical = AS2Crypto.removeTrailingCrLf(await AS2Crypto.buildNode(contentNode))

    const signedData = new AS2SignedData(canonical)
    const derBuffer = await signedData.sign({
      cert: options.cert,
      key: options.key,
      algorithm: options.algorithm
    })

    rootNode.appendChild(
      new AS2MimeNode({
        filename: SIGNATURE_FILENAME,
        contentType: 'application/pkcs7-signature',
        content: derBuffer
      })
    )

    return rootNode
  }

  /** Not yet implemented; do not use.
   * @throws ERROR.NOT_IMPLEMENTED
   */
  static async compress (node: AS2MimeNode, options: any): Promise<AS2MimeNode> {
    throw new Error(ERROR.NOT_IMPLEMENTED)
  }

  /** Not yet implemented; do not use.
   * @throws ERROR.NOT_IMPLEMENTED
   */
  static async decompress (node: AS2MimeNode, options: any): Promise<AS2MimeNode> {
    throw new Error(ERROR.NOT_IMPLEMENTED)
  }
}
