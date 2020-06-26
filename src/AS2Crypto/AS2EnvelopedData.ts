import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs/build/index'
import { Crypto } from '@peculiar/webcrypto'
import { PemFile } from './PemFile'
import { ObjectID } from './LibOid'
import { isNullOrUndefined } from '../Helpers'

const webcrypto = new Crypto()

export class AS2EnvelopedData {
  constructor (data: Buffer, enveloped: boolean = false) {
    pkijs.setEngine(
      'newEngine',
      webcrypto,
      new pkijs.CryptoEngine({
        name: '@peculiar/webcrypto',
        crypto: webcrypto,
        subtle: webcrypto.subtle
      })
    )

    if (enveloped) {
      const bufferBer = new Uint8Array(data).buffer
      const envelopedDataContentAsn1 = asn1js.fromBER(bufferBer)
      const envelopedDataContent = new pkijs.ContentInfo({ schema: envelopedDataContentAsn1.result })
      this.enveloped = new pkijs.EnvelopedData({ schema: envelopedDataContent.content })
    } else {
      this.data = new Uint8Array(data).buffer
      this.enveloped = new pkijs.EnvelopedData()
    }
  }

  data: ArrayBuffer
  enveloped: any

  private _toCertificate (cert: string | Buffer) {
    const certPemFile = new PemFile(cert)
    const certAsn1 = asn1js.fromBER(certPemFile.data)

    return new pkijs.Certificate({ schema: certAsn1.result })
  }

  private _getCertAlgorithmId (certificate: any) {
    const rsaPssId = new ObjectID({ name: 'RSA-PSS'}).id

    if (certificate.signatureAlgorithm.algorithmId === rsaPssId) {
      return rsaPssId
    }

    return certificate.subjectPublicKeyInfo.algorithm.algorithmId
  }

  private _getEncryptionAlgorithm (encryption: string) {
    const aesCbc = 'AES-CBC'

    switch (encryption.toLowerCase()) {
      case 'aes-128-cbc':
        return {
          name: aesCbc,
          length: 128
        }
      case 'aes-192-cbc':
        return {
          name: aesCbc,
          length: 128
        }
      case 'aes-256-cbc':
        return {
          name: aesCbc,
          length: 128
        }
      default:
        throw new Error('Unsupported algorithm: ' + encryption)
    }
  }

  async encrypt (cert: string | Buffer, encryption: string) {
    const crypto = pkijs.getCrypto()
    const certificate = this._toCertificate(cert)
    const publicCertOptions = crypto.getAlgorithmByOID(this._getCertAlgorithmId(certificate))
    // let certAlgorithm = 'sha-256'

    /* if ('hash' in publicCertOptions) {
      certAlgorithm = publicCertOptions.hash.name
    } */

    this.enveloped.addRecipientByCertificate(certificate /* , { oaepHashAlgorithm: certAlgorithm } */)
    await this.enveloped.encrypt(this._getEncryptionAlgorithm(encryption), this.data)

    const envelopedDataContent = new pkijs.ContentInfo({
      contentType: new ObjectID({ name: 'envelopedData' }).id,
      content: this.enveloped.toSchema()
    })
    const envelopedDataSchema = envelopedDataContent.toSchema()
    const envelopedDataBuffer = envelopedDataSchema.toBER()

    return Buffer.from(envelopedDataBuffer)
  }

  async decrypt (cert: string | Buffer, key: string | Buffer) {
    const certificate = this._toCertificate(cert)
    const privateKey = new PemFile(key).data
    this.data = await this.enveloped.decrypt(0, {
      recipientCertificate: certificate,
      recipientPrivateKey: privateKey
    })

    return Buffer.from(this.data)
  }
}
