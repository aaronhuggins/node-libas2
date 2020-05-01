import 'mocha'
import { AS2Constants, AS2MimeNode, AS2Parser } from '../core'
import { cert, key } from './helpers'
import { readFileSync } from 'fs'

describe('AS2Parser', async () => {
  it('should parse mime message to AS2MimeNode and match parsed contents', async () => {
    const buffer = readFileSync('test/test-data/content.encrypted.txt')
    const parser = new AS2Parser({ content: buffer })
    const result = await parser.parse()

    if (!(result instanceof AS2MimeNode)) {
      throw new Error(
        `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${
          (result as any).constructor.name
        }'`
      )
    }

    const rebuilt = await result.build()
    const original = buffer.toString('utf8')
    const parsed = rebuilt.toString('utf8')

    if (original !== parsed) {
      throw new Error(
        `Mime section not correctly parsed.\nExpected: '${original}'\nReceived: '${parsed}'`
      )
    }
  })
})
