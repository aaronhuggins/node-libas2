import 'mocha'
import {
  AS2Agreement,
  AS2Constants,
  AS2Composer,
  AS2ComposerOptions,
  AS2Crypto,
  AS2MimeNode,
  AS2Parser,
  parseHeaderString,
  request
} from '../core'
import { AS2_TESTING_CERT, LIBAS2_EDI, LIBAS2_CERT, LIBAS2_KEY, SIGNED_MDN } from './Helpers'
import * as assert from 'assert'
import { DateTime } from 'luxon'
import * as nock from 'nock'
import * as ping from 'ping'

const options: AS2ComposerOptions = {
  message: {
    filename: 'message.edi',
    contentType: 'application/edi-x12',
    content: LIBAS2_EDI
  },
  agreement: {
    host: {
      name: 'LibAS2 Community',
      id: 'libas2community',
      url: 'http://whatwhat.example/as2',
      certificate: LIBAS2_CERT,
      privateKey: LIBAS2_KEY,
      decrypt: false,
      sign: true,
      mdn: {
        async: true,
        signing: AS2Constants.SIGNING.SHA256
      }
    },
    partner: {
      name: 'AS2 Testing',
      id: 'as2testing',
      url: 'http://whatwhat.example/as2',
      file: 'EDIX12',
      certificate: LIBAS2_CERT,
      encrypt: AS2Constants.ENCRYPTION.AES128_GCM,
      verify: true
    }
  },
  additionalHeaders: { not: ['real'] }
}

describe('AS2Composer', async () => {
  it('should create an AS2Agreement', () => {
    const agreement = new AS2Agreement(options.agreement)

    assert.strictEqual(agreement instanceof AS2Agreement, true)
    assert.throws(() => {
      new AS2Agreement({
        host: { sign: true },
        partner: options.agreement.partner
      } as any)
    })
    assert.throws(() => {
      new AS2Agreement({
        host: options.agreement.host,
        partner: { verify: true }
      } as any)
    })
    assert.throws(() => {
      const partial: any = {
        host: {
          certificate: LIBAS2_KEY,
          sign: true
        }
      }

      new AS2Agreement(partial)
    })
    assert.throws(() => {
      const partial: any = {
        host: {
          certificate: LIBAS2_CERT,
          sign: true
        }
      }

      new AS2Agreement(partial)
    })
    assert.throws(() => {
      const partial: any = {
        host: {
          certificate: LIBAS2_CERT,
          privateKey: LIBAS2_CERT,
          sign: true
        }
      }

      new AS2Agreement(partial)
    })
    assert.throws(() => {
      const partial: any = {
        host: options.agreement.host,
        partner: {
          certificate: LIBAS2_KEY,
          verify: true
        }
      }

      new AS2Agreement(partial)
    })
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
    const pingResult = await ping.promise.probe('as2testing.centralus.cloudapp.azure.com', { timeout: 1, min_reply: 2 })

    if (!inServiceHours || !pingResult.alive) {
      // If now is outside the service hours, nock is used to provide a pre-defined mdn.
      const [headers, ...body] = SIGNED_MDN.split(/(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu)

      nock('https://as2testing.centralus.cloudapp.azure.com')
        .post('/pub/Receive.rsb')
        .reply(200, body.join('').trimLeft(), parseHeaderString(headers))
    }

    // Test using ArcESB; this is a Drummond certified product.
    const composer = new AS2Composer({
      message: options.message,
      agreement: {
        host: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: LIBAS2_CERT,
          privateKey: LIBAS2_KEY,
          decrypt: false,
          sign: true,
          mdn: { signing: AS2Constants.SIGNING.SHA256 }
        },
        partner: {
          name: 'AS2 Testing',
          id: 'as2testing',
          url: 'https://as2testing.centralus.cloudapp.azure.com/pub/Receive.rsb',
          file: 'EDIX12',
          certificate: AS2_TESTING_CERT,
          encrypt: AS2Constants.ENCRYPTION.AES192_GCM,
          verify: true
        }
      }
    })
    const result = await request(await composer.toRequestOptions())
    const mdn = await result.mime()
    const message = await mdn.verify({ cert: AS2_TESTING_CERT })

    assert.strictEqual(message instanceof AS2MimeNode, true, 'Signed MDN could not be verified.')
  }).timeout(5000)
})
