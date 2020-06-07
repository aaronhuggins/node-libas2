import 'mocha'
import { AS2MimeNode, AS2Parser, AS2Disposition } from '../core'
import { ENCRYPTED_CONTENT, SIGNED_MDN } from './Helpers'
import { Duplex } from 'stream'

describe('AS2Parser', async () => {
  it('should parse mime message to AS2MimeNode and match parsed contents', async () => {
    const result = await AS2Parser.parse(ENCRYPTED_CONTENT)
    if (!(result instanceof AS2MimeNode)) {
      throw new Error(
        `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${
          (result as any).constructor.name
        }'`
      )
    }

    if (ENCRYPTED_CONTENT !== result.raw) {
      throw new Error(
        `Mime section not correctly parsed.\nExpected: '${ENCRYPTED_CONTENT}'\nReceived: '${result.raw}'`
      )
    }
  })

  it('should parse stream to AS2MimeNode', async () => {
    const stream = new Duplex()
    stream.push(ENCRYPTED_CONTENT)
    stream.push(null)
    const result = await AS2Parser.parse(stream)
    if (!(result instanceof AS2MimeNode)) {
      throw new Error(
        `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${
          (result as any).constructor.name
        }'`
      )
    }

    if (ENCRYPTED_CONTENT !== result.raw) {
      throw new Error(
        `Mime section not correctly parsed.\nExpected: '${ENCRYPTED_CONTENT}'\nReceived: '${result.raw}'`
      )
    }
  })

  it('should parse mdn to AS2MimeNode and generate an AS2Disposition', async () => {
    const result = await AS2Parser.parse(SIGNED_MDN)
    if (!(result instanceof AS2MimeNode)) {
      throw new Error(
        `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${
          (result as any).constructor.name
        }'`
      )
    }
    // console.log(result)
    const mdn = new AS2Disposition(result)

    if (result.messageId() !== mdn.messageId) {
      throw new Error(
        `Mime section not correctly parsed.\nExpected: '${result.messageId()}'\nReceived: '${
          mdn.messageId
        }'`
      )
    }
  })
})
