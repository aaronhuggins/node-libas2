import {
  NOT_IMPLEMENTED,
  SIGNING,
  SIGNATURE_HEADER,
  SIGNATURE_FOOTER
} from '../Constants'
import forge = require('node-forge')
import crypto = require('crypto')
import { AS2MimeNode } from '../AS2MimeNode'
import { encryptionOptions, canonicalTransform } from '../Helpers'
import MimeNode = require('nodemailer/lib/mime-node')
import {
  EncryptionOptions,
  SigningOptions,
  DecryptionOptions
} from './Interfaces'
import { AS2Parser } from '../AS2Parser'

export class AS2Crypto {
  /** Method to decrypt an AS2MimeNode from a PKCS7 encrypted AS2MimeNode. */
  static async decrypt (
    node: AS2MimeNode,
    options: DecryptionOptions
  ): Promise<AS2MimeNode> {
    const data: string = Buffer.isBuffer(node.content)
      ? node.content.toString('utf8')
      : (node.content as string)
    const p7 = (forge.pkcs7 as any).messageFromPem(
      `${SIGNATURE_HEADER}${data}${SIGNATURE_FOOTER}`
    ) as forge.pkcs7.PkcsEnvelopedData
    const recipient: any = (p7 as any).findRecipient(
      forge.pki.certificateFromPem(options.cert)
    )
    ;(p7 as any).decrypt(recipient, forge.pki.privateKeyFromPem(options.key))

    // Parse Mime body from p7.content back to AS2MimeNode
    const buffer = Buffer.from(
      (p7.content as forge.util.ByteStringBuffer).getBytes(),
      'binary'
    ).toString('utf8')
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

    const buffer = await MimeNode.prototype.build.bind(node)()
    const p7 = forge.pkcs7.createEnvelopedData()

    p7.addRecipient(forge.pki.certificateFromPem(options.cert))
    p7.content = forge.util.createBuffer(buffer.toString('utf8'))
    ;(p7 as any).encrypt(undefined, forge.pki.oids[options.encryption])

    const der = forge.asn1.toDer(p7.toAsn1())
    const derBuffer = Buffer.from(der.getBytes(), 'binary')

    rootNode.setContent(derBuffer)

    return rootNode
  }

  /**
   * @description Method to verify data has not been modified from a signature.
   * @param {string|any} data - The data to verify.
   * @param {string} signature - The signature to verify.
   * @param {string} publicCert - The certificate to verify against.
   * @param {string} [algorithm='sha1'] - The algorithm for verification.
   * @returns {boolean} True when data matches signature.
   */
  public verify (
    data: string | any,
    signature: string,
    publicCert: string,
    algorithm: string = SIGNING.SHA256
  ): boolean {
    if (!signature.includes(SIGNATURE_HEADER)) {
      signature = `${SIGNATURE_HEADER}${signature}${SIGNATURE_FOOTER}`
    }

    const msg = (forge.pkcs7 as any).messageFromPem(
      signature
    ) as forge.pkcs7.PkcsEnvelopedData
    const verifier = crypto.createVerify(algorithm)

    verifier.update(Buffer.from(data))

    // The encoding 'latin1' is an alias for 'binary'.
    return verifier.verify(
      publicCert,
      (msg as any).rawCapture.signature,
      'latin1'
    )
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

    const buffer = await MimeNode.prototype.build.bind(contentNode)()
    const p7 = forge.pkcs7.createSignedData()
    p7.content = forge.util.createBuffer(buffer.toString('binary'))

    p7.addCertificate(options.cert)

    options.chain.forEach(cert => {
      p7.addCertificate(cert)
    })

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

    p7.sign()

    const asn1: any = p7.toAsn1()

    // Scrub encapContentInfo.eContent
    asn1.value[1].value[0].value[2].value.splice(1, 1)

    // Write PKCS7 ASN.1 as DER to buffer
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
  async compress (node: AS2MimeNode, options: any): Promise<AS2MimeNode> {
    throw NOT_IMPLEMENTED
  }

  /** Not yet implemented. */
  async decompress (node: AS2MimeNode, options: any): Promise<AS2MimeNode> {
    throw NOT_IMPLEMENTED
  }

  /**
   * @description Method for creating a simple self-signed certificate.
   * @param {object} options - Options for creating the certificate.
   * @returns {object} The public key, private key, and the certificate.
   */
  public createSimpleX509v3 (options: SimpleX509v3Options): any {
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
