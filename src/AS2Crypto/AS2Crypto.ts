import {
  NOT_IMPLEMENTED,
  SIGNATURE_HEADER,
  SIGNATURE_FOOTER,
  CRLF
} from '../Constants'
import forge = require('node-forge')
import crypto = require('crypto')
import { AS2MimeNode } from '../AS2MimeNode'
import { encryptionOptions, canonicalTransform, isNullOrUndefined } from '../Helpers'
import MimeNode = require('nodemailer/lib/mime-node')
import {
  EncryptionOptions,
  SigningOptions,
  DecryptionOptions,
  VerificationOptions
} from './Interfaces'
import { AS2Parser } from '../AS2Parser'
import { AS2DecryptError } from './AS2CryptoError'
import { randomBytes } from 'crypto'

interface PkcsEnvelopedData extends forge.pkcs7.PkcsEnvelopedData {
  content: forge.util.ByteStringBuffer
  authenticatedAttributes?: any[]
  certificates: Array<{
    publicKey: any
  }>
  rawCapture: {
    signature: string,
    digestAlgorithm: forge.util.ByteStringBuffer,
    signerInfos: any[]
    authenticatedAttributes?: Array<    {
    tagClass: number,
    type: number,
    constructed: boolean,
    composed: boolean,
    value: any[]
  }> }
  findRecipient(certificate: forge.pki.Certificate): forge.pki.Certificate
  decrypt(certificate: forge.pki.Certificate, key: forge.pki.PrivateKey): void
  addSigner(options: any): void
}

interface pkcs7 {
  messageFromPem(pem: string): PkcsEnvelopedData
  messageFromAsn1(asn1: forge.asn1.Asn1): PkcsEnvelopedData
}

export class AS2Crypto {
  private static async buildNode (node: AS2MimeNode): Promise<Buffer> {
    return await MimeNode.prototype.build.bind(node)()
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
    const p7 = (forge.pkcs7 as unknown as pkcs7).messageFromAsn1(asn1)
    const recipient: any = p7.findRecipient(
      forge.pki.certificateFromPem(options.cert)
    )
    if (recipient === null) {
      throw new AS2DecryptError(
        'Certificate provided was not used to encrypt message.'
      )
    }
    p7.decrypt(recipient, forge.pki.privateKeyFromPem(options.key))

    // Parse Mime body from p7.content back to AS2MimeNode
    const buffer = Buffer.from(p7.content.getBytes(), 'binary').toString('utf8')
    const revivedNode = await new AS2Parser({ content: buffer }).parse()

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

  static verify1 (verifier: {
    content: string | forge.util.ByteStringBuffer
    signature: string | forge.pkcs7.PkcsSignedData
    certificate: string | forge.pki.Certificate
  }): boolean {
    let cert: forge.pki.Certificate
    let content: string
    let signature: forge.pkcs7.PkcsSignedData
    let publicKey: forge.pki.PublicKey
    let signedAttributes: forge.asn1.Asn1

    if (typeof verifier.certificate === 'string') {
      cert = forge.pki.certificateFromPem(verifier.certificate)
    } else {
      cert = verifier.certificate
    }

    if (typeof verifier.signature === 'string') {
      signature = (forge.pkcs7 as any).messageFromPem(verifier.signature) as forge.pkcs7.PkcsSignedData
    } else {
      signature = verifier.signature
    }

    const recipient: forge.pki.Certificate = (signature as any).findRecipient(cert)

    if (isNullOrUndefined(recipient)) {
      throw new Error(
        'Certificate provided was not used to sign message; no matching recipient.'
      )
    }

    publicKey = recipient.publicKey || cert.publicKey

    if (isNullOrUndefined(publicKey)) {
      throw new Error(
        'Public key not found in either the signature or provided certificate.'
      )
    }

    if ((signature as any).rawCapture && (signature as any).rawCapture.authenticatedAttributes) {
      signedAttributes = (signature as any).rawCapture.authenticatedAttributes
      // TODO: write ASN1 validator for deserializing signedAttributes to usable object
    }

    if (verifier.content instanceof forge.util.ByteStringBuffer) {
      content = verifier.content.bytes()
    } else if (typeof verifier.content === 'string') {
      content = forge.util.encodeUtf8(verifier.content)
    }

    const contentAsn1 = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.OCTETSTRING,
      false,
      content
    )
    let contentDer = forge.asn1.toDer(contentAsn1)
    // skip identifier and length per RFC 2315 9.3
    // skip identifier (1 byte)
    contentDer.getByte()
    // read and discard length bytes
    ;(forge.asn1 as any).getBerValueLength(contentDer)

    const algorithm = forge.asn1.derToOid((signature as any).rawCapture.digestAlgorithm)
    const messageDigest = forge.md[forge.pki.oids[algorithm]].create() as forge.md.MessageDigest

    ;(messageDigest as any).start().update(contentDer.getBytes())

    return true
  }

  /** Method to verify data has not been modified from a signature. */
  static async forgeVerify (
    node: AS2MimeNode,
    options: VerificationOptions
  ): Promise<AS2MimeNode> {
    const contentPart = await AS2Crypto.buildNode(node.childNodes[0])
    const signaturePart = Buffer.isBuffer(node.childNodes[1].content)
      ? node.childNodes[1].content
      : Buffer.from(node.childNodes[1].content as string, 'base64')
    const der = forge.util.createBuffer(signaturePart)
    const asn1 = forge.asn1.fromDer(der)
    const msg = ((forge.pkcs7 as unknown) as pkcs7).messageFromAsn1(asn1)
    const attributes = msg.rawCapture.authenticatedAttributes || []
    const algorithm = forge.asn1.derToOid(msg.rawCapture.digestAlgorithm)
    const cert = crypto.createPublicKey(options.cert).export({ type: 'pkcs1', format: 'der'}) as Buffer
    const p7 = forge.pkcs7.createSignedData()
    p7.content = forge.util.createBuffer(contentPart)
    p7.addCertificate(options.cert)
    ;(p7 as any).addSigner({
      key: cert,
      certificate: options.cert,
      digestAlgorithm: algorithm,
      authenticatedAttributes: attributes as any
    })
    p7.sign()
    console.log((p7 as unknown as PkcsEnvelopedData).rawCapture)
    return null
  }

  /**
   * @description Method to verify data has not been modified from a signature.
   * @param {string|any} data - The data to verify.
   * @param {string} signature - The signature to verify.
   * @param {string} publicCert - The certificate to verify against.
   * @param {string} [algorithm='sha1'] - The algorithm for verification.
   * @returns {boolean} True when data matches signature.
   */
  static async verify (
    node: AS2MimeNode,
    options: VerificationOptions
  ): Promise<AS2MimeNode> {
    const contentPart = await AS2Crypto.buildNode(node.childNodes[0])
    const signaturePart = Buffer.isBuffer(node.childNodes[1].content)
      ? node.childNodes[1].content
      : Buffer.from(node.childNodes[1].content as string, 'base64')
    const cert = crypto.createPublicKey(options.cert)
    const der = forge.util.createBuffer(signaturePart)
    const asn1 = forge.asn1.fromDer(der)
    const msg = ((forge.pkcs7 as unknown) as pkcs7).messageFromAsn1(asn1)
    const signature = Buffer.from(msg.rawCapture.signature, 'binary')
    console.log((msg as any).rawCapture, null, 2)
    // console.log((forge.asn1 as any).prettyPrint(asn1, 1, '  '))
    // Deal with Nodemailer trailing CRLF bug by trying with and without CRLF
    const verifier = crypto.createVerify(options.micalg).update(contentPart)
    const verifierNoCrLf = crypto
      .createVerify(options.micalg)
      .update(AS2Crypto.removeTrailingCrLf(contentPart))
    const verified =
      verifier.verify(cert, signature) || verifierNoCrLf.verify(cert, signature)

    return verified ? node.childNodes[0] : null
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

  /** Not yet implemented; do not use. */
  static async compress (
    node: AS2MimeNode,
    options: any
  ): Promise<AS2MimeNode> {
    throw NOT_IMPLEMENTED
  }

  /** Not yet implemented. */
  static async decompress (
    node: AS2MimeNode,
    options: any
  ): Promise<AS2MimeNode> {
    throw NOT_IMPLEMENTED
  }

  /**
   * @description Method for creating a simple self-signed certificate.
   * @param {object} options - Options for creating the certificate.
   * @returns {object} The public key, private key, and the certificate.
   */
  static createSimpleX509v3 (options: SimpleX509v3Options): any {
    const keys = forge.pki.rsa.generateKeyPair(2048)
    const cert = forge.pki.createCertificate()

    cert.publicKey = keys.publicKey
    cert.serialNumber =
      options.serial === undefined
        ? `${Math.floor(Math.random() * 1000000000000000000)
            .toString()
            .padStart(18, '0')}`
        : `${options.serial}`
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(
      cert.validity.notBefore.getFullYear() + options.years
    )

    const attrs = [
      {
        name: 'commonName',
        value: options.commonName
      },
      {
        name: 'countryName',
        value: options.countryName
      },
      {
        shortName: 'ST',
        value: options.state === undefined ? options.ST : options.state
      },
      {
        name: 'localityName',
        value: options.city === undefined ? options.localityName : options.city
      },
      {
        name: 'organizationName',
        value:
          options.organizationName === undefined
            ? options.OU
            : options.organizationName
      },
      {
        shortName: 'OU',
        value: options.OU
      }
    ]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      },
      {
        name: 'nsCertType',
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 6, // URI
            value: options.URI
          },
          {
            type: 7, // IP
            ip: options.IP
          }
        ]
      },
      {
        name: 'subjectKeyIdentifier'
      }
    ])

    // self-sign certificate
    const digest =
      forge.md[options.digest] === undefined
        ? forge.md.sha256
        : forge.md[options.digest]

    cert.sign(keys.privateKey, digest.create())

    return {
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      certificate: forge.pki.certificateToPem(cert)
    }
  }
}

interface SimpleX509v3Options {
  city?: string
  commonName: string
  countryName: string
  digest?: 'sha1' | 'sha256' | 'sha384' | 'sha512'
  IP: string
  localityName?: string
  organizationName?: string
  OU: string
  serial?: number | string
  ST?: string
  state?: string
  URI: string
  years: number
}
