import 'mocha'
import {
  AS2Constants,
  AS2Composer,
  AS2ComposerOptions,
  AS2Crypto,
  AS2Helpers
} from '../core'
import { AS2_TESTING_CERT, LIBAS2_EDI, LIBAS2_CERT, LIBAS2_KEY } from './Helpers'
import { ENCRYPTION, SIGNING } from '../src/Constants'
import { readFileSync, writeFileSync } from 'fs'
import { AS2Parser } from '../src/AS2Parser'

const options: AS2ComposerOptions = {
  message: {
    filename: 'message.edi',
    contentType: 'application/edi-x12',
    content: LIBAS2_EDI
  },
  agreement: {
    recipient: 'libas2community',
    sender: 'as2testing',
    sign: { cert: LIBAS2_CERT, key: LIBAS2_KEY },
    encrypt: { cert: LIBAS2_CERT, encryption: AS2Constants.ENCRYPTION._3DES },
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
    const decrypted = await AS2Crypto.decrypt(compiled, {
      cert: LIBAS2_CERT,
      key: LIBAS2_KEY
    })
    const decryptedContent = decrypted.childNodes[0].content.toString('utf8')

    if (decryptedContent !== LIBAS2_EDI) {
      throw new Error(
        `Mime section not correctly signed.\nExpected: '${LIBAS2_EDI}'\nReceived: '${decryptedContent}'`
      )
    }
  }).timeout(1000)

  it('should produce a valid AS2 request', async () => {
    // TODO: Test using ArcESB or pyAS2; mendelson AS2 is a bust due to non-conforming request/response.
    // Ideally, come up with a way to test send/receive against a Drummond certified product.
    // NOTE: Mendelson might not be a bust with new mime parser; test interop again.
    const composer = new AS2Composer({
      message: options.message,
      agreement: {
        sender: 'libas2community',
        recipient: 'as2testing',
        sign: { cert: LIBAS2_CERT, key: LIBAS2_KEY, micalg: SIGNING.SHA256 },
        encrypt: { cert: AS2_TESTING_CERT, encryption: ENCRYPTION.DES3 },
        mdn: {
          to: 'mycompanyAS2@example-message.net',
          sign: {
            importance: 'required',
            protocol: 'pkcs7-signature',
            micalg: SIGNING.SHA256
          }
        }
      }
    })
    const compiled = await composer.request(true)
    const result = await AS2Helpers.request({
      url: 'https://as2testing.centralus.cloudapp.azure.com/pub/Receive.rsb',
      headers: compiled.headers,
      body: compiled.body as Buffer
    })
    const mdn = await result.parsed
    const message = await mdn.verify({ cert: AS2_TESTING_CERT })
    if (!message) {
      throw new Error('Signed MDN could not be verified.')
    }
  }).timeout(5000)
})
