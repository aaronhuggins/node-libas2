import { NOT_IMPLEMENTED, CRLF } from '../Constants'
import * as forge from 'node-forge'
import { AS2MimeNode } from '../AS2MimeNode'
import { encryptionOptions, canonicalTransform } from '../Helpers'
import * as MimeNode from 'nodemailer/lib/mime-node'
import {
  EncryptionOptions,
  SigningOptions,
  DecryptionOptions,
  VerificationOptions
} from './Interfaces'
import { AS2Parser } from '../AS2Parser'
import { randomBytes } from 'crypto'
import { verify as forgeVerify } from './ForgeVerify'

interface PkcsEnvelopedData extends forge.pkcs7.PkcsEnvelopedData {
  content: forge.util.ByteStringBuffer
  authenticatedAttributes?: any[]
  certificates: Array<{
    publicKey: any
  }>
  rawCapture: {
    signature: string
    digestAlgorithm: forge.util.ByteStringBuffer
    signerInfos: any[]
    authenticatedAttributes?: Array<{
      tagClass: number
      type: number
      constructed: boolean
      composed: boolean
      value: any[]
    }>
  }
  findRecipient(certificate: forge.pki.Certificate): forge.pki.Certificate
  decrypt(certificate: forge.pki.Certificate, key: forge.pki.PrivateKey): void
  addSigner(options: any): void
}

interface pkcs7 {
  messageFromPem(pem: string): PkcsEnvelopedData
  messageFromAsn1(asn1: forge.asn1.Asn1): PkcsEnvelopedData
}

/** Class for cryptography methods supported by AS2. */
export class AS2Crypto {
  private static async buildNode (node: AS2MimeNode): Promise<Buffer> {
    return node.parsed
      ? await node.build()
      : await MimeNode.prototype.build.bind(node)()
  }

  /** A fix for signing with Nodemailer to produce verifiable SMIME;
   * the library joins multipart boundaries without the part's trailing CRLF,
   * where OpenSSL and other SMIME clients keep each part's last CRLF. */
  static removeTrailingCrLf (buffer: Buffer): Buffer {
    const trailingBytes = buffer.slice(buffer.length - 2, buffer.length)

    return trailingBytes.toString('utf8') === CRLF
      ? buffer.slice(0, buffer.length - 2)
      : buffer
  }

  /** Crux to generate UUID-like random strings */
  static generateUniqueId (): string {
    const byteLengths = [4, 2, 2, 2, 6]

    return byteLengths
      .map(byteLength => randomBytes(byteLength).toString('hex'))
      .join('-')
  }

  /** Method to decrypt an AS2MimeNode from a PKCS7 encrypted AS2MimeNode. */
  static async decrypt (
    node: AS2MimeNode,
    options: DecryptionOptions
  ): Promise<AS2MimeNode> {
    const data: Buffer = Buffer.isBuffer(node.content)
      ? node.content
      : Buffer.from(node.content as string, 'base64')
    const der = forge.util.createBuffer(data)
    const asn1 = forge.asn1.fromDer(der)
    const p7 = ((forge.pkcs7 as unknown) as pkcs7).messageFromAsn1(asn1)
    const recipient: any = p7.findRecipient(
      forge.pki.certificateFromPem(options.cert)
    )
    if (recipient === null) {
      throw new Error('Certificate provided was not used to encrypt message.')
    }
    p7.decrypt(recipient, forge.pki.privateKeyFromPem(options.key))

    // Parse Mime body from p7.content back to AS2MimeNode
    const buffer = Buffer.from(p7.content.getBytes(), 'binary').toString('utf8')
    const revivedNode = await AS2Parser.parse(buffer)

    return revivedNode
  }

  /** Method to envelope an AS2MimeNode in an encrypted AS2MimeNode. */
  static async encrypt (
    node: AS2MimeNode,
    options: EncryptionOptions
  ): Promise<AS2MimeNode> {
    options = encryptionOptions(options)
    const rootNode = new AS2MimeNode({
      filename: 'smime.p7m',
      contentType: 'application/pkcs7-mime; smime-type=enveloped-data'
    })

    canonicalTransform(node)

    const buffer = await AS2Crypto.buildNode(node)
    const p7 = forge.pkcs7.createEnvelopedData() as PkcsEnvelopedData

    p7.addRecipient(forge.pki.certificateFromPem(options.cert))
    p7.content = forge.util.createBuffer(buffer.toString('utf8'))
    ;(p7 as any).encrypt(undefined, forge.pki.oids[options.encryption])

    const der = forge.asn1.toDer(p7.toAsn1())
    const derBuffer = Buffer.from(der.getBytes(), 'binary')

    rootNode.setContent(derBuffer)

    return rootNode
  }

  /** Method to verify data has not been modified from a signature. */
  static async verify (
    node: AS2MimeNode,
    options: VerificationOptions
  ): Promise<boolean> {
    const contentPart = await AS2Crypto.buildNode(node.childNodes[0])
    const contentBuffer = forge.util.createBuffer(contentPart)
    const contentBufferNoCrLf = forge.util.createBuffer(
      AS2Crypto.removeTrailingCrLf(contentPart)
    )
    const signaturePart = Buffer.isBuffer(node.childNodes[1].content)
      ? node.childNodes[1].content
      : Buffer.from(node.childNodes[1].content as string, 'base64')
    const der = forge.util.createBuffer(signaturePart)
    const asn1 = forge.asn1.fromDer(der)
    const msg = ((forge.pkcs7 as unknown) as pkcs7).messageFromAsn1(asn1)
    const verify = forgeVerify.bind(msg)
    // Deal with Nodemailer trailing CRLF bug by trying with and without CRLF
    const verified: boolean =
      verify({ certificate: options.cert, detached: contentBuffer }) ||
      verify({ certificate: options.cert, detached: contentBufferNoCrLf })

    return verified
  }

  /** Method to sign data against a certificate and key pair. */
  static async sign (
    node: AS2MimeNode,
    options: SigningOptions
  ): Promise<AS2MimeNode> {
    const rootNode = new AS2MimeNode({
      contentType: `multipart/signed; protocol="application/pkcs7-signature"; micalg=${options.micalg};`,
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

    const buffer = AS2Crypto.removeTrailingCrLf(
      await AS2Crypto.buildNode(contentNode)
    )
    const p7 = forge.pkcs7.createSignedData()
    p7.content = forge.util.createBuffer(buffer)

    p7.addCertificate(options.cert)

    p7.addSigner({
      key: options.key,
      certificate: options.cert,
      digestAlgorithm: forge.pki.oids[options.micalg],
      authenticatedAttributes: [
        {
          type: forge.pki.oids.contentType,
          value: forge.pki.oids.data
        },
        {
          type: forge.pki.oids.messageDigest
        },
        {
          type: forge.pki.oids.signingTime
        }
      ]
    })

    p7.sign({ detached: true })

    // Write PKCS7 ASN.1 as DER to buffer
    const asn1 = p7.toAsn1()
    const der = forge.asn1.toDer(asn1)
    const derBuffer = Buffer.from(der.getBytes(), 'binary')

    rootNode.appendChild(
      new AS2MimeNode({
        filename: 'smime.p7s',
        contentType: 'application/pkcs7-signature',
        content: derBuffer
      })
    ) as AS2MimeNode

    return rootNode
  }

  /** Not yet implemented; do not use.
   * @throws NOT_IMPLEMENTED
  */
  static async compress (
    node: AS2MimeNode,
    options: any
  ): Promise<AS2MimeNode> {
    throw NOT_IMPLEMENTED
  }

  /** Not yet implemented.
   * @throws NOT_IMPLEMENTED
  */
  static async decompress (
    node: AS2MimeNode,
    options: any
  ): Promise<AS2MimeNode> {
    throw NOT_IMPLEMENTED
  }
}
