import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs/build/index'
import { Crypto } from '@peculiar/webcrypto'
import { PemFile } from './PemFile'
import { ObjectID } from './LibOid'
import { isNullOrUndefined } from '../Helpers'
import { AS2Constants } from '../Constants'

const { SIGNING } = AS2Constants
const webcrypto = new Crypto()

export class AS2SignedData {
  constructor (data: Buffer, signedData?: Buffer) {
    pkijs.setEngine(
      'newEngine',
      webcrypto,
      new pkijs.CryptoEngine({
        name: '@peculiar/webcrypto',
        crypto: webcrypto,
        subtle: webcrypto.subtle
      })
    )

    this.data = new Uint8Array(data).buffer

    if (isNullOrUndefined(signedData)) {
      this.signed = new pkijs.SignedData({
        version: 1,
        encapContentInfo: new pkijs.EncapsulatedContentInfo({
          eContentType: new ObjectID({ name: 'data' }).id
        }),
        signerInfos: [],
        certificates: []
      })
    } else {
      const bufferBer = new Uint8Array(signedData).buffer
      const signedDataContentAsn1 = asn1js.fromBER(bufferBer)
      const signedDataContent = new pkijs.ContentInfo({
        schema: signedDataContentAsn1.result
      })
      this.signed = new pkijs.SignedData({ schema: signedDataContent.content })
    }
  }

  data: ArrayBuffer
  digestInfo?: {
    digest: ArrayBuffer
    algorithm: string
  }
  signed: {
    version: number
    encapContentInfo: any
    signerInfos: any[]
    certificates: any[]
    sign: (...args: any) => Promise<void>
    verify: (
      ...args: any
    ) => Promise<
      | boolean
      | {
          signatureVerified: boolean
        }
    >
    toSchema: (...args: any) => any
  }

  private _toCertificate (cert: string | Buffer | PemFile) {
    const certPemFile = new PemFile(cert)
    const certAsn1 = asn1js.fromBER(certPemFile.data)

    return new pkijs.Certificate({ schema: certAsn1.result })
  }

  private _addSignerInfo (certificate: any, messageDigest: ArrayBuffer): number {
    this.signed.certificates.push(certificate)
    const position = this.signed.signerInfos.push(
      new pkijs.SignerInfo({
        sid: new pkijs.IssuerAndSerialNumber({
          issuer: certificate.issuer,
          serialNumber: certificate.serialNumber
        }),
        signedAttrs: new pkijs.SignedAndUnsignedAttributes({
          type: 0,
          attributes: [
            new pkijs.Attribute({
              type: new ObjectID({ name: 'contentType' }).id,
              values: [
                new asn1js.ObjectIdentifier({
                  value: new ObjectID({ name: 'data' }).id
                })
              ]
            }),
            new pkijs.Attribute({
              type: new ObjectID({ name: 'signingTime' }).id,
              values: [new asn1js.UTCTime({ valueDate: new Date() })]
            }),
            new pkijs.Attribute({
              type: new ObjectID({ name: 'messageDigest' }).id,
              values: [
                new asn1js.OctetString({
                  valueHex: messageDigest
                })
              ]
            })
          ]
        })
      })
    )

    return position - 1
  }

  private _getCertAlgorithmId (certificate: any) {
    const rsaPssId = new ObjectID({ name: 'RSA-PSS' }).id

    if (certificate.signatureAlgorithm.algorithmId === rsaPssId) {
      return rsaPssId
    }

    return certificate.subjectPublicKeyInfo.algorithm.algorithmId
  }

  private async _addSigner ({ cert, key, algorithm }: SignMethodOptions) {
    if (isNullOrUndefined(algorithm)) algorithm = SIGNING.SHA256
    const crypto = pkijs.getCrypto()
    const certificate = this._toCertificate(cert)
    const messageDigest = await crypto.digest({ name: algorithm }, this.data)
    const privateKeyOptions = crypto.getAlgorithmByOID(this._getCertAlgorithmId(certificate))

    if ('hash' in privateKeyOptions) {
      privateKeyOptions.hash.name = algorithm
    }

    const keyPemFile = new PemFile(key)
    const privateKey = await webcrypto.subtle.importKey('pkcs8', keyPemFile.data, privateKeyOptions, true, ['sign'])
    const index = this._addSignerInfo(certificate, messageDigest)

    this.digestInfo = {
      digest: messageDigest,
      algorithm: algorithm
    }

    await this.signed.sign(privateKey, index, algorithm, this.data)
  }

  private _findSigner (cert?: string | Buffer | PemFile): number {
    if (!isNullOrUndefined(cert)) {
      const certificate = this._toCertificate(cert)

      for (let i = 0; i < this.signed.signerInfos.length; i += 1) {
        const signerInfo = this.signed.signerInfos[i]

        if (
          certificate.issuer.isEqual(signerInfo.sid.issuer) &&
          certificate.serialNumber.isEqual(signerInfo.sid.serialNumber)
        ) {
          return i
        }
      }
    }

    return -1
  }

  private async _calculateMessageDigest (index: number) {
    const crypto = pkijs.getCrypto()
    const algorithmId = this.signed.signerInfos[index].digestAlgorithm.algorithmId
    const hashAlgorithm = crypto.getAlgorithmByOID(algorithmId)

    this.digestInfo = {
      digest: await crypto.digest(hashAlgorithm.name, new Uint8Array(this.data)),
      algorithm: hashAlgorithm.name
    }
  }

  getMessageDigest (): {
    digest: Buffer
    algorithm: string
  } {
    if (typeof this.digestInfo !== 'undefined') {
      return {
        digest: Buffer.from(this.digestInfo.digest),
        algorithm: this.digestInfo.algorithm
      }
    }

    throw new Error('Message digest not yet calculated.')
  }

  async sign ({ cert, key, algorithm, addSigners }: SignMethodOptions): Promise<Buffer> {
    await this._addSigner({ cert, key, algorithm })

    if (Array.isArray(addSigners)) {
      for (const options of addSigners) {
        await this._addSigner(options)
      }
    }

    const signedDataContent = new pkijs.ContentInfo({
      contentType: new ObjectID({ name: 'signedData' }).id,
      content: this.signed.toSchema(true)
    })
    const signedDataSchema = signedDataContent.toSchema()
    const signedDataBuffer = signedDataSchema.toBER()

    return Buffer.from(signedDataBuffer)
  }

  async verify (cert?: string | Buffer | PemFile, debugMode?: boolean): Promise<boolean> {
    const index = this._findSigner(cert)

    if (!isNullOrUndefined(cert) && index === -1) {
      return false
    }

    const result: any = await this.signed.verify({
      signer: index === -1 ? 0 : index,
      data: this.data,
      extendedMode: true
    })

    if (result.signatureVerified) {
      await this._calculateMessageDigest(index)
    }

    return debugMode ? result : result.signatureVerified
  }
}

export interface SignMethodOptions {
  cert: string | Buffer | PemFile
  key: string | Buffer | PemFile
  algorithm: string
  addSigners?: Array<{
    cert: string | Buffer | PemFile
    key: string | Buffer | PemFile
    algorithm: string
  }>
}
