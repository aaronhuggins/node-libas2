import 'mocha'
import { AS2Constants, AS2Composer, AS2ComposerOptions } from '../core'
import { run, content, cert, key } from './helpers'
import { simpleParser } from 'mailparser'
import { writeFileSync } from 'fs'

const options: AS2ComposerOptions = {
  message: {
    filename: 'message.edi',
    contentType: 'application/edi-x12',
    content
  },
  agreement: {
    recipient: '112084681T',
    sender: 'NETHEALTHCG',
    sign: { cert, key },
    encrypt: { cert, encryption: AS2Constants.ENCRYPTION._3DES },
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
    /* ,
      'prepared': {
        prepared: true,
        value: 'parepared value'
      } as unknown as string // Tricking the compiler to test suppert for a nodemailer feature.
      */
  })

  it('should produce a valid AS2 message', async () => {
    const composer = new AS2Composer(options)
    const compiled = await composer.compile()
    const message = await compiled.build()

    writeFileSync('test/temp-data/as2message.txt', message.toString('utf8'))

    const openssl = await run(
      'bash -c "openssl smime -decrypt -in test/temp-data/as2message.txt -recip test/test-data/sample_cert.cer  -inkey test/test-data/sample_priv.key -des3"'
    )
    const parsed = await simpleParser(openssl)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly signed.\nExpected: '${content}'\nReceived: '${opensslContent}'`
      )
    }
  }).timeout(1000)

  it('should produce a valid AS2 request', async () => {
    const composer = new AS2Composer(options)
    const compiled = await composer.compileRequest(true)
  }).timeout(1000)
})
