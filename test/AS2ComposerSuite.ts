import 'mocha'
import {
  AS2Constants,
  AS2Composer,
  AS2ComposerOptions,
  AS2Crypto
} from '../core'
import { content, cert, key } from './Helpers'
import { ENCRYPTION, SIGNING } from '../src/Constants'
import { default as got } from 'got'
import { readFileSync } from 'fs'

const options: AS2ComposerOptions = {
  message: {
    filename: 'message.edi',
    contentType: 'application/edi-x12',
    content
  },
  agreement: {
    recipient: '112084681T',
    sender: 'NETHEALTHCG',
    sign: { cert, key },
    encrypt: { cert, encryption: AS2Constants.ENCRYPTION._3DES },
    mdn: {
      to: 'WHATEVER@WHATWHAT.EXAMPLE',
      deliveryUrl: 'http://whatwhat.example/as2',
      sign: {
        importance: 'required',
        protocol: 'pkcs7-signature',
        micalg: 'sha256'
      }
    },
    headers: { not: ['real'] }
  }
}

describe('AS2Composer', async () => {
  it('should set headers on AS2 message without error', async () => {
    const composer = new AS2Composer(options)
    composer.setHeaders({ 'fake-header': 'not-a-real-header' })
    composer.setHeaders([{ key: 'fake-header', value: 'not-a-real-header' }])
  })

  it('should produce a valid AS2 message', async () => {
    const composer = new AS2Composer(options)
    const compiled = await composer.compile()
    const decrypted = await AS2Crypto.decrypt(compiled, { cert, key })
    const decryptedContent = decrypted.childNodes[0].content.toString('utf8')

    if (decryptedContent !== content) {
      throw new Error(
        `Mime section not correctly signed.\nExpected: '${content}'\nReceived: '${decryptedContent}'`
      )
    }
  }).timeout(1000)

  it('should produce a valid AS2 request', async () => {
    const publicCert = readFileSync(
      'test/test-data/mendelsonAS2_test_recipient_cert.cer',
      'utf8'
    )
    const privateCert = readFileSync(
      'test/test-data/mendelsonAS2_test_sender_cert.cer',
      'utf8'
    )
    const privateKey = readFileSync(
      'test/test-data/mendelsonAS2_test_sender_key.key',
      'utf8'
    )
    const composer = new AS2Composer({
      message: options.message,
      agreement: {
        sender: 'mycompanyAS2',
        recipient: 'mendelsontestAS2',
        sign: { cert: privateCert, key: privateKey, micalg: SIGNING.SHA256 },
        encrypt: { cert: publicCert, encryption: ENCRYPTION.DES3 },
        mdn: { to: 'mycompanyAS2@example-message.net' }
      }
    })
    const compiled = await composer.request(true)
    const result = await got({
      url: 'http://testas2.mendelson-e-c.com:8080/as2/HttpReceiver',
      method: 'POST',
      headers: compiled.headers,
      body: compiled.body
    })
    console.log(result.headers) //.rawBody.toString('utf8'))
    console.log(result.rawBody.toString('utf8'))
  }).timeout(5000)
})
