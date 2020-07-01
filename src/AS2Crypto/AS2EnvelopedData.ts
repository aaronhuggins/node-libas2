import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs/build/index'
import { Crypto } from '@peculiar/webcrypto'
import { PemFile } from './PemFile'
import { ObjectID } from './LibOid'
import { AS2Encryption } from './Interfaces'

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
      const envelopedDataContent = new pkijs.ContentInfo({
        schema: envelopedDataContentAsn1.result
      })
      this.enveloped = new pkijs.EnvelopedData({
        schema: envelopedDataContent.content
      })
    } else {
      this.data = new Uint8Array(data).buffer
      this.enveloped = new pkijs.EnvelopedData()
    }
  }

  data: ArrayBuffer
  enveloped: any

  private _toCertificate (cert: string | Buffer | PemFile) {
    const certPemFile = new PemFile(cert)
    const certAsn1 = asn1js.fromBER(certPemFile.data)

    return new pkijs.Certificate({ schema: certAsn1.result })
  }

  private _getEncryptionAlgorithm (encryption: AS2Encryption) {
    const CBC = 'AES-CBC'
    const GCM = 'AES-GCM'

    switch (encryption) {
      case 'aes128-CBC':
        return {
          name: CBC,
          length: 128
        }
      case 'aes192-CBC':
        return {
          name: CBC,
          length: 192
        }
      case 'aes256-CBC':
        return {
          name: CBC,
          length: 256
        }
      case 'aes128-GCM':
        return {
          name: GCM,
          length: 128
        }
      case 'aes192-GCM':
        return {
          name: GCM,
          length: 192
        }
      case 'aes256-GCM':
        return {
          name: GCM,
          length: 256
        }
      default:
        throw new Error('Unsupported algorithm: ' + encryption)
    }
  }

  async encrypt (cert: string | Buffer | PemFile, encryption: AS2Encryption) {
    const certificate = this._toCertificate(cert)

    this.enveloped.addRecipientByCertificate(certificate)
    await this.enveloped.encrypt(
      this._getEncryptionAlgorithm(encryption),
      this.data
    )

    const envelopedDataContent = new pkijs.ContentInfo({
      contentType: new ObjectID({ name: 'envelopedData' }).id,
      content: this.enveloped.toSchema()
    })
    const envelopedDataSchema = envelopedDataContent.toSchema()
    const envelopedDataBuffer = envelopedDataSchema.toBER()

    return Buffer.from(envelopedDataBuffer)
  }

  async decrypt (cert: string | Buffer | PemFile, key: string | Buffer | PemFile) {
    const certificate = this._toCertificate(cert)
    const privateKey = new PemFile(key).data
    this.data = await this.enveloped.decrypt(0, {
      recipientCertificate: certificate,
      recipientPrivateKey: privateKey
    })

    return Buffer.from(this.data)
  }
}
