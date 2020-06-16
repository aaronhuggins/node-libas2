import {
  AS2Disposition,
  AS2DispositionOptions,
  AS2DispositionNotification,
  AS2MimeNode,
  AS2Constants
} from '../core'
import * as assert from 'assert'

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
})
