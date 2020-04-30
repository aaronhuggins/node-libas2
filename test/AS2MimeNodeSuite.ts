import 'mocha'
import { AS2Constants, AS2MimeNode } from '../core'
import { run, cert, key, content } from './helpers'
import { simpleParser } from 'mailparser'
import { writeFileSync } from 'fs'

describe('AS2MimeNode', async () => {
  it('should be verified by openssl.', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert, key },
      content
    })
    const signed = await smime.build()

    writeFileSync('test/temp-data/multipart.txt', signed.toString('utf8'))

    const openssl = await run(
      [
        'openssl smime',
        '-verify -noverify',
        '-in test/temp-data/multipart.txt',
        '-signer test/test-data/sample_cert.cer'
      ].join(' ')
    )
    const parsed = await simpleParser(openssl)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

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

    writeFileSync('test/temp-data/encrypted.txt', encrypted.toString('utf8'))

    const openssl = await run(
      [
        'openssl smime',
        '-decrypt -in test/temp-data/encrypted.txt',
        '-recip test/test-data/sample_cert.cer',
        '-inkey test/test-data/sample_priv.key -des3'
      ].join(' ')
    )
    const parsed = await simpleParser(openssl)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

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

    writeFileSync(
      'test/temp-data/signed-encrypted.txt',
      encrypted.toString('utf8')
    )

    const openssl = await run(
      [
        'openssl smime',
        '-decrypt -in test/temp-data/signed-encrypted.txt',
        '-recip test/test-data/sample_cert.cer',
        '-inkey test/test-data/sample_priv.key -des3'
      ].join(' ')
    )
    const parsed = await simpleParser(openssl)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`
      )
    }
  })
})
