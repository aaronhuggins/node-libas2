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
      }
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
    const disposition = await mime.dispositionIn({ cert: AS2_TESTING_CERT })

    mime.childNodes[0].childNodes[1].content =
      'X-CUSTOM-DATA: Some MDNs might have custom headers.'
    const customDisposition = new AS2Disposition(mime)

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
    const fakeAs2Header = 'AS2-To: fake@recipient.unreal\r\n'
    const mime = await AS2Parser.parse(fakeAs2Header + SIGNED_CONTENT)
    const dispositionSignedMime = await mime.dispositionOut({
      returnNode: true,
      signDisposition: { cert: LIBAS2_CERT, key: LIBAS2_KEY },
      signed: { cert: LIBAS2_CERT }
    })

    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + MIME_CONTENT)
    })
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + ENCRYPTED_CONTENT),
      encrypted: { cert: LIBAS2_CERT, key: LIBAS2_KEY }
    })
    // Force a disposition decryption failure message
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + ENCRYPTED_CONTENT),
      encrypted: { cert: AS2_TESTING_CERT, key: LIBAS2_CERT }
    })
    // Force a disposition verification failure message
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + SIGNED_CONTENT),
      signed: { cert: AS2_TESTING_CERT }
    })
    // Force a disposition generic failure message
    await AS2Disposition.outgoing({
      node: await AS2Parser.parse(fakeAs2Header + MIME_CONTENT),
      signed: { cert: AS2_TESTING_CERT }
    })

    assert.strictEqual(dispositionSignedMime instanceof AS2MimeNode, true)
    await assert.rejects(async () => {
      await AS2Disposition.outgoing({ node: null })
    })
    await assert.rejects(async () => {
      await AS2Disposition.outgoing({
        node: await AS2Parser.parse(SIGNED_CONTENT)
      })
    })
  })

  it('should construct notification', () => {
    const notification = new AS2DispositionNotification({} as any, null)

    assert.strictEqual(typeof notification.headers, 'undefined')
  })
})
