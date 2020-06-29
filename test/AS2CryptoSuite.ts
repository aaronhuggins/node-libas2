import 'mocha'
import {
  AS2Crypto,
  AS2MimeNode,
  AS2Parser,
  objectIds,
  ObjectID,
  PemFile
} from '../core'
import {
  LIBAS2_CERT,
  LIBAS2_KEY,
  LIBAS2_EDI,
  ENCRYPTED_CONTENT,
  SIGNED_CONTENT,
  openssl
} from './Helpers'
import * as assert from 'assert'
import { readFileSync, writeFileSync } from 'fs'
import { AS2SignedData } from '../src/AS2Crypto/AS2SignedData'

describe('AS2Crypto', async () => {
  it('should decrypt contents of parsed mime message', async () => {
    const result = await AS2Parser.parse(ENCRYPTED_CONTENT)
    const decrypted = await result.decrypt({
      cert: LIBAS2_CERT,
      key: LIBAS2_KEY
    })
    const decryptedContent = decrypted.content.toString('utf8')

    assert.strictEqual(decryptedContent, LIBAS2_EDI)
  })

  it('should verify signed contents of parsed mime message', async () => {
    const result = await AS2Parser.parse(SIGNED_CONTENT)
    const verified = await AS2Crypto.verify(result, { cert: LIBAS2_CERT })

    assert.strictEqual(verified, true, 'Mime section could not be verified.')
  })

  it('should verify cms message produced by openssl', async () => {
    /*
     * Issue: https://github.com/ahuggins-nhs/node-libas2/issues/9
     * Payload MUST be canonicalized to CRLF in order for libraries to verify.
     * OpenSSL command line will ALWAYS canonicalize payloads as a convenience.
     * Thus, if "echo Something to Sign > payload" is ran on Linux, OpenSSL will
     * sign different content then what is read in by Javascript.
     * This is the reason that an SMIME signature or a signature with the payload
     * attached can be verified; the content accompanies the signature in the
     * form it was signed.
     */
    writeFileSync('test/temp-data/payload', 'Something to Sign\r\n')
    await openssl({
      command: 'req',
      arguments: {
        new: true,
        x509: true,
        nodes: true,
        keyout: 'test/temp-data/x509.key',
        out: 'test/temp-data/x509.pub',
        subj: '/CN=SampleCert'
      }
    })
    await openssl({
      command: 'cms',
      arguments: {
        sign: true,
        signer: 'test/temp-data/x509.pub',
        inkey: 'test/temp-data/x509.key',
        outform: 'DER',
        out: 'test/temp-data/signature-cms.bin',
        in: 'test/temp-data/payload'
      }
    })
    const osslVerified = await openssl({
      command: 'cms',
      arguments: {
        verify: true,
        CAfile: 'test/temp-data/x509.pub',
        inkey: 'test/temp-data/x509.pub',
        inform: 'DER',
        in: 'test/temp-data/signature-cms.bin',
        content: 'test/temp-data/payload'
      }
    })

    assert.strictEqual(osslVerified, true, 'OpenSSL verification')

    const certAsPem = readFileSync('test/temp-data/x509.pub')
    const payloadAsBin = readFileSync('test/temp-data/payload')
    const sig_as_der = readFileSync('test/temp-data/signature-cms.bin')
    const signedData = new AS2SignedData(payloadAsBin, sig_as_der)
    const pkijsVerified = await signedData.verify(certAsPem)

    assert.strictEqual(pkijsVerified, true, 'PKIjs verification')
  })

  it('should look up cms oid info by name and id', () => {
    const byId = objectIds.byId('1.2.840.113549.1.7.1')
    const byName = objectIds.byName('encryptedData')
    const objectId = new ObjectID({ id: '1.2.840.113549.1.7.6' })
    const exists = objectIds.has('unreal')

    assert.strictEqual(byId.name, 'data')
    assert.strictEqual(byName.id, '1.2.840.113549.1.7.6')
    assert.strictEqual(objectId.name, 'encryptedData')
    assert.strictEqual(exists, false)
    assert.throws(() => {
      new ObjectID({})
    })
  })

  it('should parse a pem file to der and infer type', () => {
    const undefinedOrNullPem = new PemFile(null)
    const keyPem = new PemFile(LIBAS2_KEY.replace('PRIVATE KEY', 'PUBLIC KEY'))
    const certificateDerPem = Buffer.from(
      LIBAS2_CERT.split('\n') // Split on new line
        .filter(line => !line.includes('-BEGIN') && !line.includes('-END')) // Remove header/trailer
        .map(line => line.trim()) // Trim extra white space
        .join(''),
      'base64'
    )
    const fromDerPem = PemFile.fromDer(certificateDerPem, 'CERTIFICATE')

    assert.strictEqual(fromDerPem.data instanceof ArrayBuffer, true)
    assert.strictEqual(keyPem.type, 'PUBLIC_KEY')
    assert.strictEqual(typeof undefinedOrNullPem.type, 'undefined')
    assert.doesNotThrow(() => {
      PemFile.fromDer(certificateDerPem)
    })
  })

  it('should throw error on compression methods', () => {
    assert.rejects(AS2Crypto.compress(new AS2MimeNode({}), {}))
    assert.rejects(AS2Crypto.decompress(new AS2MimeNode({}), {}))
  })
})
