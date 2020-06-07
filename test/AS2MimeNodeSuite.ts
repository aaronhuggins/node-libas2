import 'mocha'
import { AS2Constants, AS2MimeNode, AS2Parser } from '../core'
import {
  openssl,
  LIBAS2_CERT,
  LIBAS2_KEY,
  LIBAS2_EDI,
  LIBAS2_CERT_PATH,
  LIBAS2_KEY_PATH
} from './Helpers'

describe('AS2MimeNode', async () => {
  it('should be verified by openssl', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert: LIBAS2_CERT, key: LIBAS2_KEY },
      content: LIBAS2_EDI
    })
    const signed = await smime.build()
    const verified = await openssl({
      command: 'cms',
      input: signed,
      arguments: {
        verify: true,
        noverify: true,
        certfile: LIBAS2_CERT_PATH
      }
    })

    if (!verified) {
      throw new Error('Mime section not correctly signed.')
    }
  })

  it('should be decrypted by openssl', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert: LIBAS2_CERT, key: LIBAS2_KEY },
      encrypt: { cert: LIBAS2_CERT, encryption: AS2Constants.ENCRYPTION._3DES },
      content: LIBAS2_EDI
    })
    const encrypted = await smime.build()
    const output = await openssl({
      command: 'cms',
      input: encrypted,
      arguments: {
        decrypt: true,
        recip: LIBAS2_CERT_PATH,
        inkey: LIBAS2_KEY_PATH,
        des3: true
      }
    })
    const parsed = await AS2Parser.parse(output)
    const opensslContent = parsed.childNodes[0].content.toString('utf8')

    if (opensslContent !== LIBAS2_EDI) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${LIBAS2_EDI}'\nReceived: '${opensslContent}'`
      )
    }
  })
})
