import 'mocha'
import {
  AS2Constants,
  AS2Composer,
  AS2ComposerOptions,
  AS2Crypto,
  AS2MimeNode,
  request
} from '../core'
import {
  AS2_TESTING_CERT,
  LIBAS2_EDI,
  LIBAS2_CERT,
  LIBAS2_KEY,
  SIGNED_MDN
} from './Helpers'
import * as assert from 'assert'
import { DateTime } from 'luxon'
import * as nock from 'nock'
import { parseHeaderString } from '../src/Helpers'
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
    encrypt: {
      cert: LIBAS2_CERT,
      encryption: AS2Constants.ENCRYPTION.AES128_GCM
    },
    mdn: {
      to: 'WHATEVER@WHATWHAT.EXAMPLE',
      deliveryUrl: 'http://whatwhat.example/as2',
      sign: {
        importance: 'required',
        protocol: 'pkcs7-signature',
        micalg: 'sha-256'
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

    assert.strictEqual(decryptedContent, LIBAS2_EDI)
  }).timeout(1000)

  it('should make a valid AS2 exchange', async () => {
    // AS2 testing server is only available between 5:30 AM and 7 PM, Central time.
    // Main development takes place in time zone America/Chicago.
    const now = DateTime.utc().setZone('America/Chicago')
    const startTime = now.set({ hour: 5, minute: 30, second: 0 })
    const endTime = now.set({ hour: 19, minute: 0, second: 0 })
    const inServiceHours = now > startTime && now < endTime

    if (!inServiceHours) {
      // If now is outside the service hours, nock is used to provide a pre-defined mdn.
      const [headers, ...body] = SIGNED_MDN.split(
        /(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu
      )

      nock('https://as2testing.centralus.cloudapp.azure.com')
        .post('/pub/Receive.rsb')
        .reply(200, body.join('').trimLeft(), parseHeaderString(headers))
    }

    // Test using ArcESB; this is a Drummond certified product.
    const composer = new AS2Composer({
      message: options.message,
      agreement: {
        sender: 'libas2community',
        recipient: 'as2testing',
        sign: {
          cert: LIBAS2_CERT,
          key: LIBAS2_KEY,
          algorithm: AS2Constants.SIGNING.SHA256
        },
        encrypt: {
          cert: AS2_TESTING_CERT,
          encryption: AS2Constants.ENCRYPTION.AES192_GCM
        },
        mdn: {
          to: 'mycompanyAS2@example-message.net',
          sign: {
            importance: 'required',
            protocol: 'pkcs7-signature',
            micalg: AS2Constants.SIGNING.SHA256
          }
        }
      }
    })
    const result = await request(
      await composer.toRequestOptions(
        'https://as2testing.centralus.cloudapp.azure.com/pub/Receive.rsb'
      )
    )
    const mdn = inServiceHours
      ? await result.mime()
      : await AS2Parser.parse({
          headers: result.rawHeaders,
          content: result.rawBody
        })
    const message = await mdn.verify({ cert: AS2_TESTING_CERT })

    assert.strictEqual(
      message instanceof AS2MimeNode,
      true,
      'Signed MDN could not be verified.'
    )
  }).timeout(5000)
})
