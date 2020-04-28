import { Readable } from 'stream'
import MimeNode = require('nodemailer/lib/mime-node')
import mimeFuncs = require('nodemailer/lib/mime-funcs')
import forge = require('node-forge')
import {
  isNullOrUndefined,
  signingOptions,
  encryptionOptions,
  canonicalTransform
} from '../Helpers'
import {
  AS2MimeNodeOptions,
  SigningOptions,
  EncryptionOptions
} from './Interfaces'
import { AS2Headers } from '../Interfaces'

export interface AS2MimeNode {
  keepBcc: boolean
  _headers: Array<{
    key: string
    value: string
  }>
  filename: string
  date: Date
  content: string | Buffer | Readable
  contentType: string
  rootNode: AS2MimeNode
  childNodes: AS2MimeNode[]
  normalizeHeaderKey: Function
  _handleContentType(structured: any): void
  _encodeWords(value: string): string
  _encodeHeaderValue(key: string, value: string): string
}

export class AS2MimeNode extends MimeNode {
  constructor (options: AS2MimeNodeOptions) {
    const {
      filename,
      content,
      baseBoundary,
      contentType,
      contentDisposition,
      messageId,
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

  setSigning (options: SigningOptions): AS2MimeNode {
    this._sign = signingOptions(options)

    return this
  }

  setEncryption (options: EncryptionOptions): AS2MimeNode {
    this._encrypt = encryptionOptions(options)

    return this
  }

  getHeaders (asObject: boolean = false): AS2Headers {
    let transferEncoding = this.getTransferEncoding()
    let headers: AS2Headers = asObject ? {} : []

    if (transferEncoding) {
      this.setHeader('Content-Transfer-Encoding', transferEncoding)
    }

    if (this.filename && !this.getHeader('Content-Disposition')) {
      this.setHeader('Content-Disposition', 'attachment')
    }

    // Ensure mandatory header fields
    if (this.rootNode === this) {
      if (!this.getHeader('Date')) {
        this.setHeader('Date', this.date.toUTCString().replace(/GMT/, '+0000'))
      }

      // ensure that Message-Id is present
      this.messageId()

      if (!this.getHeader('MIME-Version')) {
        this.setHeader('MIME-Version', '1.0')
      }
    }

    this._headers.forEach(header => {
      let key = header.key
      let value = header.value
      let structured
      let param
      let options: any = {}
      let formattedHeaders = [
        'From',
        'Sender',
        'To',
        'Cc',
        'Bcc',
        'Reply-To',
        'Date',
        'References'
      ]

      if (
        value &&
        typeof value === 'object' &&
        !formattedHeaders.includes(key)
      ) {
        Object.keys(value).forEach(key => {
          if (key !== 'value') {
            options[key] = value[key]
          }
        })
        value = ((value as any).value || '').toString()
        if (!value.trim()) {
          return
        }
      }

      if (options.prepared) {
        if (asObject) {
          headers[key] = value
        } else {
          ;(headers as any[]).push({ key, value })
        }

        return
      }

      switch (header.key) {
        case 'Content-Disposition':
          structured = mimeFuncs.parseHeaderValue(value)
          if (this.filename) {
            structured.params.filename = this.filename
          }
          value = mimeFuncs.buildHeaderValue(structured)
          break
        case 'Content-Type':
          structured = mimeFuncs.parseHeaderValue(value)

          this._handleContentType(structured)

          if (
            structured.value.match(/^text\/plain\b/) &&
            typeof this.content === 'string' &&
            /[\u0080-\uFFFF]/.test(this.content)
          ) {
            structured.params.charset = 'utf-8'
          }

          value = mimeFuncs.buildHeaderValue(structured)

          if (this.filename) {
            // add support for non-compliant clients like QQ webmail
            // we can't build the value with buildHeaderValue as the value is non standard and
            // would be converted to parameter continuation encoding that we do not want
            param = this._encodeWords(this.filename)

            if (
              param !== this.filename ||
              /[\s'"\\;:/=(),<>@[\]?]|^-/.test(param)
            ) {
              // include value in quotes if needed
              param = '"' + param + '"'
            }
            value += '; name=' + param
          }
          break
        case 'Bcc':
          if (!this.keepBcc) {
            // skip BCC values
            return
          }
          break
      }

      value = this._encodeHeaderValue(key, value)

      // skip empty lines
      if (!(value || '').toString().trim()) {
        return
      }

      if (typeof this.normalizeHeaderKey === 'function') {
        let normalized = this.normalizeHeaderKey(key, value)
        if (normalized && typeof normalized === 'string' && normalized.length) {
          key = normalized
        }
      }

      if (asObject) {
        headers[key] = value
      } else {
        ;(headers as any[]).push({ key, value })
      }
    })

    return headers
  }

  async sign (options?: SigningOptions): Promise<AS2MimeNode> {
    options = !isNullOrUndefined(options)
      ? signingOptions(options)
      : !isNullOrUndefined(this._sign)
      ? this._sign
      : signingOptions(options)
    const rootNode = new AS2MimeNode({
      contentType: `multipart/signed; protocol="application/pkcs7-signature"; micalg=${options.micalg};`,
      encrypt: this._encrypt
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
      : !isNullOrUndefined(this._encrypt)
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
