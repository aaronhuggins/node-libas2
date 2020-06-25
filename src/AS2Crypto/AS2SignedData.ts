import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs/build/index'
import { Crypto } from '@peculiar/webcrypto'
import { PemFile } from './PemFile'
import { ObjectID } from './LibOid'

const webcrypto = new Crypto()

export class AS2SignedData {
  constructor (data: Buffer) {
    pkijs.setEngine(
      'newEngine',
      webcrypto,
      new pkijs.CryptoEngine({
        name: '@peculiar/webcrypto',
        crypto: webcrypto,
        subtle: webcrypto.subtle
      })
    )

    this.data = data
    this.signed = new pkijs.SignedData({
      version: 1,
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: new ObjectID({ name: 'data' }).id
      }),
      signerInfos: [],
      certificates: []
    })
  }

  data: Buffer
  signed: {
    version: number
    encapContentInfo: any
    signerInfos: any[]
    certificates: any[]
    sign: (...args: any) => void
    toSchema: (...args: any) => any
  }

  private _addSignerInfo(certificate: any, messageDigest: ArrayBuffer): number {
    this.signed.certificates.push(certificate)
    const position = this.signed.signerInfos.push(new pkijs.SignerInfo({
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
                value: new ObjectID({ name: 'data' }).id,
              })
            ]
          }),
          new pkijs.Attribute({
            type: new ObjectID({ name: 'signingTime' }).id,
            values: [
              new asn1js.UTCTime({ valueDate: new Date() })
            ]
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
    }))

    return position - 1
  }

  private async _addSigner ({ cert, key, algorithm }: SignMethodOptions) {
    const crypto = pkijs.getCrypto()
    const certPemFile = new PemFile(cert)
    const certAsn1 = asn1js.fromBER(certPemFile.data)
    const certificate = new pkijs.Certificate({ schema: certAsn1.result })
    const messageDigest = await crypto.digest(
      { name: algorithm },
      this.data
    )
    const keyPemFile = new PemFile(key)
    const privateKey = await webcrypto.subtle.importKey('pkcs8', keyPemFile.data, {
      name: 'RSA-PSS',
      hash: algorithm
    }, true, ['sign'])
    const index = this._addSignerInfo(certificate, messageDigest)

    await this.signed.sign(privateKey, index, algorithm, this.data)
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
}

export interface SignMethodOptions {
  cert: string,
  key: string,
  algorithm: string,
  addSigners?: Array<{
    cert: string,
    key: string,
    algorithm: string,
  }>
}
