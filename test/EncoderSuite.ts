import 'mocha'
import {
  AS2Constants,
  AS2MimePart,
  AS2MimeMultipartSigned,
  AS2MimeEncrypted,
  AS2Message
} from '../core'

import fs = require('fs')
import { simpleParser } from 'mailparser'
import { AS2MimeNode } from '../src/AS2MimeNode'

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

  it('should produce an empty AS2 message', () => {
    const as2message = new AS2Message()

    if (as2message.getHeaders() !== undefined) {
      throw new Error('AS2Message should be empty.')
    }

    const message = new AS2Message(Buffer.from(content), {
      receipt: AS2Constants.RECEIPT.SEND_SIGNED,
      algorithm: AS2Constants.SIGNING.SHA256,
      encryption: AS2Constants.ENCRYPTION.DES3,
      senderCert: cert,
      receiverCert: cert,
      privateKey: key,
      message: {
        mimeType: 'application/edi-x12',
        name: 'message.edi',
        headers: {
          'Content-Disposition': 'attachment; filename="message.edi"'
        },
        encoding: 'base64'
      },
      agreement: {
        as2From: '112084681T',
        as2To: 'NETHEALTHCG',
        email: 'WHATEVER@WHATWHAT.EXAMPLE'
      }
    })

    fs.writeFileSync('test/temp-data/as2message.txt', message.toString())
  })
})
