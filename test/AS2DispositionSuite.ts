import {
  AS2Disposition,
  AS2DispositionOptions,
  AS2DispositionNotification,
  AS2MimeNode,
  AS2Constants
} from '../core'
import * as assert from 'assert'
import { AS2Parser } from '../src/AS2Parser'
import {
  SIGNED_CONTENT,
  SIGNED_MDN,
  AS2_TESTING_CERT,
  LIBAS2_CERT,
  LIBAS2_KEY,
  MIME_CONTENT,
  ENCRYPTED_CONTENT
} from './Helpers'

describe('AS2Disposition', () => {
  it('should construct disposition from plain object options.', async () => {
    const opts: AS2DispositionOptions = {
      explanation:
        'Sample explanation. An error or a success message in human readable form might go here.',
      notification: {
        disposition: {
          type: 'automatic-action',
          processed: true
        },
        finalRecipient: 'some-recipient'
      },
      returned: false
    }

    const disposition = new AS2Disposition(opts)
    const mime = disposition.toMimeNode()

    assert.strictEqual(mime instanceof AS2MimeNode, true)
  })

  it('should construct disposition from complete options.', async () => {
    const opts: AS2DispositionOptions = {
      explanation:
        'Sample explanation. An error or a success message in human readable form might go here.',
      notification: new AS2DispositionNotification({
        disposition: {
          type: 'automatic-action',
          processed: true
        },
        finalRecipient: 'some-recipient',
        originalMessageId: AS2MimeNode.generateMessageId(),
        mdnGateway: 'NOPE.FAKE.NOTREAL',
        receivedContentMic: {
          mic:
            'VGhlc2UgYXJlIHRoZSB2b3lhZ2VzIG9mIHRoZSBzdGFyc2hpcCBFbnRlcnByaXNlLg==',
          algorithm: AS2Constants.SIGNING.SHA256
        },
        headers: {
          'X-CUSTOM-DATA': 'Some MDNs might have custom headers.'
        }
      }),
      returned: new AS2MimeNode({
        content: 'Example',
        contentType: 'text/plain'
      })
    }

    const disposition = new AS2Disposition(opts)
    const mime = disposition.toMimeNode()

    assert.strictEqual(mime instanceof AS2MimeNode, true)
  })

  it('should derive disposition from incoming disposition', async () => {
    const mime = await AS2Parser.parse(SIGNED_MDN)
    const dispositionSigned = await mime.dispositionIn({
      cert: AS2_TESTING_CERT
    })
    const disposition = await mime.dispositionIn()

    mime.childNodes[0].childNodes[1].content =
      'X-CUSTOM-DATA: Some MDNs might have custom headers.'
    const customDisposition = new AS2Disposition(mime)

    assert.strictEqual(dispositionSigned instanceof AS2Disposition, true)
    assert.strictEqual(disposition instanceof AS2Disposition, true)
    assert.strictEqual(
      customDisposition.notification.headers['X-CUSTOM-DATA'],
      'Some MDNs might have custom headers.'
    )
    assert.throws(() => {
      new AS2Disposition({} as any)
    })
    await assert.rejects(async () => {
      await AS2Disposition.incoming(mime, { cert: LIBAS2_CERT })
    })
    await assert.rejects(async () => {
      await AS2Disposition.incoming(null, { cert: LIBAS2_CERT })
    })
  })

  it('should generate outgoing disposition from incoming message', async () => {
    // Fake header is only for testing purposes; real AS2 messages should already posess this header.
    const fakeAs2Header = 'AS2-To: fake.recipient.unreal\r\n'
    const mime = await AS2Parser.parse(fakeAs2Header + SIGNED_CONTENT)
    const dispositionMime = await mime.dispositionOut({
      agreement: {
        host: { name: 'LibAS2 Community', id: 'libas2community', url: 'http://whatwhat.example/as2' },
        partner: { name: 'AS2 Testing', id: 'as2testing', url: 'http://whatwhat.example/as2' }
      },
      returnNode: true
    })
    const dispositionSignedMime = await mime.dispositionOut({
      agreement: {
        host: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: LIBAS2_CERT,
          privateKey: LIBAS2_KEY
        },
        partner: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: LIBAS2_CERT,
          verify: true,
          mdn: { signing: 'sha-256' }
        }
      },
      returnNode: true
    })

    assert.strictEqual(
      dispositionMime.contentNode instanceof AS2MimeNode &&
      dispositionMime.dispositionNode instanceof AS2MimeNode &&
      dispositionMime.disposition instanceof AS2Disposition,
      true
    )
    assert.strictEqual(
      dispositionSignedMime.contentNode instanceof AS2MimeNode &&
      dispositionSignedMime.dispositionNode instanceof AS2MimeNode &&
      dispositionSignedMime.disposition instanceof AS2Disposition,
      true
    )

    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + MIME_CONTENT),
      agreement: {
        host: { name: 'LibAS2 Community', id: 'libas2community', url: 'http://whatwhat.example/as2' },
        partner: { name: 'AS2 Testing', id: 'as2testing', url: 'http://whatwhat.example/as2' }
      }
    })
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + ENCRYPTED_CONTENT),
      agreement: {
        host: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: LIBAS2_CERT,
          privateKey: LIBAS2_KEY,
          decrypt: true
        },
        partner: { name: 'AS2 Testing', id: 'as2testing', url: 'http://whatwhat.example/as2' }
      }
    })
    // Force a disposition decryption failure message
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + ENCRYPTED_CONTENT),
      agreement: {
        host: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: AS2_TESTING_CERT,
          privateKey: LIBAS2_CERT,
          decrypt: true
        },
        partner: { name: 'AS2 Testing', id: 'as2testing', url: 'http://whatwhat.example/as2' }
      }
    })
    // Force a disposition verification failure message
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + SIGNED_CONTENT),
      agreement: {
        host: { name: 'LibAS2 Community', id: 'libas2community', url: 'http://whatwhat.example/as2' },
        partner: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: AS2_TESTING_CERT,
          verify: true
        }
      }
    })
    // Force a disposition generic failure message
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + MIME_CONTENT),
      agreement: {
        host: { name: 'LibAS2 Community', id: 'libas2community', url: 'http://whatwhat.example/as2' },
        partner: {
          name: 'LibAS2 Community',
          id: 'libas2community',
          url: 'http://whatwhat.example/as2',
          certificate: AS2_TESTING_CERT,
          verify: true
        }
      }
    })

    await assert.rejects(async () => {
      await AS2Disposition.outgoing({
        node: null,
        agreement: {
          host: { name: 'LibAS2 Community', id: 'libas2community', url: 'http://whatwhat.example/as2' },
          partner: { name: 'AS2 Testing', id: 'as2testing', url: 'http://whatwhat.example/as2' }
        }
      })
    })
    await assert.rejects(async () => {
      await AS2Disposition.outgoing({
        node: await AS2Parser.parse(SIGNED_CONTENT),
        agreement: {
          host: { name: 'LibAS2 Community', id: 'libas2community', url: 'http://whatwhat.example/as2' },
          partner: { name: 'AS2 Testing', id: 'as2testing', url: 'http://whatwhat.example/as2' }
        }
      })
    })
  })

  it('should construct notification', () => {
    const notification = new AS2DispositionNotification({} as any, null)

    assert.strictEqual(typeof notification.headers, 'undefined')
  })
})
