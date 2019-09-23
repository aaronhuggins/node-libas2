import 'mocha'
import { AS2Constants, AS2MimePart, AS2MimeMultipartSigned, AS2MimeEncrypted, AS2Message } from '../core'

import fs = require('fs')

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

describe('AS2Encoder', () => {
  it('should match makemime output.', async () => {
    const mime = new AS2MimePart(
      content,
      {
        mimeType: 'application/edi-x12'
      }
    ) // new AS2MimePart(content)
    const makemime = await run('bash -c "makemime -c "application/edi-x12" -e 8bit test/test-data/sample_edi.edi"')

    // Command 'makemime' encodes using lf instead of crlf; this is non-standard MIME, which requires crlf for control char.
    if (mime.toString() !== makemime.replace(/\n/gu, '\r\n')) {
      throw new Error(`Mime section not correctly constructed.\nExpected: '${makemime}'\nReceived: '${mime.toString()}'`)
    }
  })

  it('should be verified by openssl.', async () => {
    const mime = new AS2MimePart(
      Buffer.from(content),
      {
        mimeType: 'application/edi-x12',
        name: 'message.edi',
        headers: { 'Content-Disposition': 'attachment; filename="message.edi"' },
        encoding: 'base64'
      }
    )
    const smime = new AS2MimeMultipartSigned(mime, { publicCert: cert })

    fs.writeFileSync('test/temp-data/multipart.txt', smime.toString(key))

    const openssl = await run('bash -c "openssl smime -verify -noverify -in test/temp-data/multipart.txt -signer test/test-data/sample_cert.cer"')

    if (mime.toString() !== openssl) {
      throw new Error(`Mime section not correctly signed.\nExpected: '${mime.toString()}'\nReceived: '${openssl}'`)
    }
  })

  it('should be decrypted by openssl', async () => {
    const mime = new AS2MimePart(
      content,
      {
        attachHeaders: false,
        mimeType: 'application/edi-x12',
        name: 'message.edi',
        headers: { 'Content-Disposition': 'attachment; filename="message.edi"' },
        encoding: 'binary'
      }
    )
    const smime = new AS2MimeMultipartSigned(mime, { publicCert: cert }, key)

    const encrypted = new AS2MimeEncrypted(smime, { publicCert: cert })

    fs.writeFileSync('test/temp-data/encrypted.txt', encrypted.toString())

    const openssl = await run('bash -c "openssl smime -decrypt -in test/temp-data/encrypted.txt -recip test/test-data/sample_cert.cer  -inkey test/test-data/sample_priv.key -des3"')

    if (smime.toString() !== openssl) {
      throw new Error(`Mime section not correctly encrypted.\nExpected: '${smime.toString()}'\nReceived: '${openssl}'`)
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
        headers: { 'Content-Disposition': 'attachment; filename="message.edi"' },
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
