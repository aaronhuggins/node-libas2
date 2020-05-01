import 'mocha'
import { AS2Constants, AS2MimeNode } from '../core'
import { openssl, cert, key, content } from './Helpers'
import { AS2Parser } from '../src/AS2Parser'

describe('AS2MimeNode', async () => {
  it('should be verified by openssl', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert, key },
      content
    })
    const signed = await smime.build()
    const output = await openssl({
      command: 'smime',
      input: signed,
      arguments: {
        verify: true,
        noverify: true,
        signer: 'test/test-data/sample_cert.cer'
      }
    })
    const parsed = await new AS2Parser({ content: output }).parse()
    const opensslContent = parsed.content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly signed.\nExpected: '${content}'\nReceived: '${opensslContent}'`
      )
    }
  })

  it('should be encrypted', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      encrypt: { cert, encryption: AS2Constants.ENCRYPTION._3DES },
      content
    })
    const encrypted = await smime.build()
    const output = await openssl({
      command: 'smime',
      input: encrypted,
      arguments: {
        decrypt: true,
        recip: 'test/test-data/sample_cert.cer',
        inkey: 'test/test-data/sample_priv.key',
        des3: true
      }
    })
    const parsed = await new AS2Parser({ content: output }).parse()
    const opensslContent = parsed.content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`
      )
    }
  })

  it('should be decrypted by openssl', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert, key },
      encrypt: { cert, encryption: AS2Constants.ENCRYPTION._3DES },
      content
    })
    const encrypted = await smime.build()
    const output = await openssl({
      command: 'smime',
      input: encrypted,
      arguments: {
        decrypt: true,
        recip: 'test/test-data/sample_cert.cer',
        inkey: 'test/test-data/sample_priv.key',
        des3: true
      }
    })
    const parsed = await new AS2Parser({ content: output }).parse()
    const opensslContent = parsed.childNodes[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`
      )
    }
  })
})
