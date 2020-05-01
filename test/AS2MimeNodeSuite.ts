import 'mocha'
import { AS2Constants, AS2MimeNode } from '../core'
import { openssl, cert, key, content } from './helpers'
import { simpleParser } from 'mailparser'
import { writeFileSync } from 'fs'

describe('AS2MimeNode', async () => {
  it('should be verified by openssl', async () => {
    const fileName = 'test/temp-data/signed.txt'
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert, key },
      content
    })
    const signed = await smime.build()

    writeFileSync(fileName, signed.toString('utf8'))

    const output = await openssl({
      command: 'smime',
      arguments: {
        verify: true,
        noverify: true,
        in: fileName,
        signer: 'test/test-data/sample_cert.cer'
      }
    })
    const parsed = await simpleParser(output)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly signed.\nExpected: '${content}'\nReceived: '${opensslContent}'`
      )
    }
  })

  it('should be encrypted', async () => {
    const fileName = 'test/temp-data/encrypted.txt'
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      encrypt: { cert, encryption: AS2Constants.ENCRYPTION._3DES },
      content
    })
    const encrypted = await smime.build()

    writeFileSync(fileName, encrypted.toString('utf8'))

    const output = await openssl({
      command: 'smime',
      arguments: {
        decrypt: true,
        in: fileName,
        recip: 'test/test-data/sample_cert.cer',
        inkey: 'test/test-data/sample_priv.key',
        des3: true
      }
    })
    const parsed = await simpleParser(output)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`
      )
    }
  })

  it('should be decrypted by openssl', async () => {
    const fileName = 'test/temp-data/signed-encrypted.txt'
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert, key },
      encrypt: { cert, encryption: AS2Constants.ENCRYPTION._3DES },
      content
    })
    const encrypted = await smime.build()

    writeFileSync(fileName, encrypted.toString('utf8'))

    const output = await openssl({
      command: 'smime',
      arguments: {
        decrypt: true,
        in: fileName,
        recip: 'test/test-data/sample_cert.cer',
        inkey: 'test/test-data/sample_priv.key',
        des3: true
      }
    })
    const parsed = await simpleParser(output)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`
      )
    }
  })
})
