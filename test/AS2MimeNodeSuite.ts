import 'mocha'
import {
  AS2Constants,
  AS2MimeNode,
  AS2Parser,
  getReportNode,
  parseHeaderString,
  getProtocol
} from '../core'
import {
  openssl,
  LIBAS2_CERT,
  LIBAS2_KEY,
  LIBAS2_EDI,
  LIBAS2_CERT_PATH,
  LIBAS2_KEY_PATH
} from './Helpers'
import * as assert from 'assert'

describe('AS2MimeNode', async () => {
  it('signed should be verified by openssl', async () => {
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

    assert.strictEqual(verified, true, 'Mime section not correctly signed.')
  })

  it('encrypted should be decrypted by openssl', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      encrypt: {
        cert: LIBAS2_CERT,
        encryption: AS2Constants.ENCRYPTION.AES128_CBC
      },
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
    const opensslContent = parsed.content.toString('utf8')

    assert.strictEqual(opensslContent, LIBAS2_EDI)
  })

  it('signed and encrypted should be decrypted by openssl', async () => {
    const smime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      sign: { cert: LIBAS2_CERT, key: LIBAS2_KEY },
      encrypt: {
        cert: LIBAS2_CERT,
        encryption: AS2Constants.ENCRYPTION.AES192_CBC
      },
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

    assert.strictEqual(opensslContent, LIBAS2_EDI)
  })

  it('should set message id', () => {
    const mime = new AS2MimeNode({
      filename: 'message.edi',
      contentType: 'application/edi-x12',
      contentDisposition: 'attachment',
      content: LIBAS2_EDI
    })
    const messageId = mime.messageId(true)

    assert.strictEqual(mime.messageId(), messageId)
  })

  it('should pass helper tests', () => {
    const reportNode = getReportNode(null)
    const parseHeaderResult = parseHeaderString(null)
    const parseHeaderMultiple = parseHeaderString(
      `Header: 1\r\n
      Header: 2\r\n
      Header: 3\r\n`,
      true
    )

    assert.strictEqual(typeof reportNode === 'undefined', true)
    assert.deepStrictEqual(parseHeaderResult, {})
    assert.deepStrictEqual(parseHeaderMultiple, { header: ['1', '2', '3'] })
    assert.throws(() => {
      getProtocol(null)
    })
  })
})
