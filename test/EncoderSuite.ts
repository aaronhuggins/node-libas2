import 'mocha'
import { AS2Constants, AS2MimeNode, AS2Composer } from '../core'

import fs = require('fs')
import { simpleParser } from 'mailparser'

const content = fs.readFileSync('test/test-data/sample_edi.edi', 'utf8')
const cert = fs.readFileSync('test/test-data/sample_cert.cer', 'utf8')
const key = fs.readFileSync('test/test-data/sample_priv.key', 'utf8')
const run = async function run (command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cp = require('child_process') // eslint-disable-line @typescript-eslint/no-var-requires
    const output: string[] = []
    const error: string[] = []
    const child = cp.exec(command)

    child.stdout.on('data', (data: string) => output.push(data))
    child.stderr.on('data', (data: string) => error.push(data))
    child.on('close', () => {
      resolve(output.join(''))
    })
    child.on('error', (err: Error) => reject(err))
  })
}

describe('AS2Encoder', async () => {
  it('should be verified by openssl.', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert, key },
      content
    })
    const signed = await smime.build()

    fs.writeFileSync('test/temp-data/multipart.txt', signed.toString('utf8'))

    const openssl = await run(
      'bash -c "openssl smime -verify -noverify -in test/temp-data/smime2.txt -signer test/test-data/sample_cert.cer"'
    )
    const parsed = await simpleParser(openssl)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly signed.\nExpected: '${content}'\nReceived: '${opensslContent}'`
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

    fs.writeFileSync('test/temp-data/encrypted.txt', encrypted.toString('utf8'))

    const openssl = await run(
      'bash -c "openssl smime -decrypt -in test/temp-data/encrypted.txt -recip test/test-data/sample_cert.cer  -inkey test/test-data/sample_priv.key -des3"'
    )
    const parsed = await simpleParser(openssl)
    const opensslContent = parsed.attachments[0].content.toString('utf8')

    if (opensslContent !== content) {
      throw new Error(
        `Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`
      )
    }
  })

  it('should produce a valid AS2 message', async () => {
    const composer = new AS2Composer({
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
          sign: {
            importance: 'required',
            protocol: 'pkcs7-signature',
            micalg: 'sha256'
          }
        }
      }
    })
    const compiled = await composer.compile()
    const message = await compiled.build()

    fs.writeFileSync('test/temp-data/as2message.txt', message.toString('utf8'))
  })
})
