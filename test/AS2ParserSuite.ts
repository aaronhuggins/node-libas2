import 'mocha'
import { AS2MimeNode, AS2Parser, AS2Disposition, parseHeaderString } from '../core'
import { ENCRYPTED_CONTENT, SIGNED_MDN } from './Helpers'
import { Duplex } from 'stream'
import * as assert from 'assert'

describe('AS2Parser', async () => {
  it('should parse mime message to AS2MimeNode and match parsed contents', async () => {
    const result = await AS2Parser.parse(ENCRYPTED_CONTENT)
    if (!(result instanceof AS2MimeNode)) {
      throw new Error(
        `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${(result as any).constructor.name}'`
      )
    }

    assert.strictEqual(result.raw, ENCRYPTED_CONTENT)
  })

  it('should parse stream to AS2MimeNode', async () => {
    const stream = new Duplex()
    stream.push(ENCRYPTED_CONTENT)
    stream.push(null)
    const result = await AS2Parser.parse(stream)

    assert.strictEqual(
      result instanceof AS2MimeNode,
      true,
      `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${(result as any).constructor.name}'`
    )
  })

  it('should parse options to AS2MimeNode', async () => {
    const [headers, ...body] = ENCRYPTED_CONTENT.split(/(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu)
    const stream = new Duplex()
    stream.push(body.join('').trimLeft())
    stream.push(null)
    // Should handle header object like Node IncomingMessage.headers
    const resultWithHeaderObject = await AS2Parser.parse({
      headers: parseHeaderString(headers) as any,
      content: stream
    })
    // Should handle header object like Node IncomingMessage.rawHeaders
    const resultWithHeaderArray = await AS2Parser.parse({
      headers: headers
        .replace(/(\r\n|\n\r|\n)( |\t)/gu, ' ')
        .split(/\n|: /gu)
        .map(line => line.trim())
        .filter(line => line !== ''),
      content: body.join('').trimLeft()
    })

    assert.strictEqual(resultWithHeaderObject instanceof AS2MimeNode, true)
    assert.strictEqual(resultWithHeaderArray instanceof AS2MimeNode, true)
  })

  it('should parse mdn to AS2MimeNode and generate an AS2Disposition', async () => {
    const result = await AS2Parser.parse(SIGNED_MDN)

    assert.strictEqual(
      result instanceof AS2MimeNode,
      true,
      `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${(result as any).constructor.name}'`
    )

    const mdn = new AS2Disposition(result)

    assert.strictEqual(result.messageId(), mdn.messageId)
  })
})
