import { Readable } from 'stream'
import MimeNode = require('nodemailer/lib/mime-node')
import forge = require('node-forge')
import {
  isNullOrUndefined,
  signingOptions,
  encryptionOptions,
  canonicalTransform
} from './AS2Helpers'
import {
  AS2MimeNodeOptions,
  SigningOptions,
  EncryptionOptions
} from './AS2MimeNodeInterfaces'

export class AS2MimeNode extends MimeNode {
  constructor (options: AS2MimeNodeOptions) {
    const {
      filename,
      content,
      baseBoundary,
      contentType,
      contentDisposition,
      headers,
      sign,
      encrypt
    } = options

    super(contentType, { filename, baseBoundary })

    if (!isNullOrUndefined(content)) this.setContent(content)
    if (!isNullOrUndefined(headers)) this.setHeader(headers)
    if (!isNullOrUndefined(sign)) this.setSigning(sign)
    if (!isNullOrUndefined(encrypt)) this.setEncryption(encrypt)
    this.setHeader(
      'Content-Disposition',
      isNullOrUndefined(contentDisposition) ? 'attachment' : contentDisposition
    )
  }

  private _sign: SigningOptions
  private _encrypt: EncryptionOptions
  content: string | Buffer | Readable
  childNodes: AS2MimeNode[]

  setSigning (options: SigningOptions): AS2MimeNode {
    this._sign = signingOptions(options)

    return this
  }

  setEncryption (options: EncryptionOptions): AS2MimeNode {
    this._encrypt = encryptionOptions(options)

    return this
  }

  async sign (options?: SigningOptions): Promise<AS2MimeNode> {
    options = !isNullOrUndefined(options)
      ? signingOptions(options)
      : isNullOrUndefined(this._sign)
      ? this._sign
      : signingOptions(options)
    const rootNode = new AS2MimeNode({
      contentType: `multipart/signed; protocol="application/pkcs7-signature"; micalg=${options.micalg};`
    })
    const contentNode = rootNode.appendChild(
      Object.assign(new MimeNode(), this)
    ) as AS2MimeNode
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

    const buffer = await contentNode.build()
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
    const signatureNode = rootNode.createChild('application/pkcs7-signature', {
      filename: 'smime.p7s'
    })

    signatureNode.setContent(derBuffer)

    return rootNode
  }

  async encrypt (options?: EncryptionOptions): Promise<AS2MimeNode> {
    options = !isNullOrUndefined(options)
      ? encryptionOptions(options)
      : isNullOrUndefined(this._encrypt)
      ? this._encrypt
      : encryptionOptions(options)
    const rootNode = new AS2MimeNode({
      filename: 'smime.p7m',
      contentType: 'application/x-pkcs7-mime; smime-type=enveloped-data'
    })
    const buffer = await super.build()
    const p7 = forge.pkcs7.createEnvelopedData()

    p7.addRecipient(forge.pki.certificateFromPem(options.cert))
    p7.content = forge.util.createBuffer(buffer.toString('utf8'))
    p7.encrypt(undefined, forge.pki.oids[options.encryption])

    const der = forge.asn1.toDer(p7.toAsn1())
    const derBuffer = Buffer.from(der.getBytes(), 'binary')

    rootNode.setContent(derBuffer)

    return rootNode
  }

  async build (): Promise<Buffer> {
    if (!isNullOrUndefined(this._sign) && !isNullOrUndefined(this._encrypt)) {
      const signed = await this.sign(this._sign)
      const encrypted = await signed.encrypt(this._encrypt)

      return await encrypted.build()
    }

    if (!isNullOrUndefined(this._sign)) {
      const signed = await this.sign(this._sign)

      return await signed.build()
    }

    if (!isNullOrUndefined(this._encrypt)) {
      const encrypted = await this.encrypt(this._encrypt)

      return await encrypted.build()
    }

    return await super.build()
  }
}