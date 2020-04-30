import 'mocha'
import { AS2Constants, AS2MimeNode, AS2Parser } from '../core'
import { cert, key, content } from './helpers'
import { readFileSync } from 'fs'

describe('AS2Parser', async () => {
  it('should parse mime message to AS2MimeNode and match parsed contents', async () => {
    const buffer = readFileSync('test/test-data/content.encrypted.txt')
    const parser = new AS2Parser({ content: buffer })
    const result = await parser.parse()
    const decrypted = await result.decrypt({ cert, key })

    const decryptedContent = decrypted.content.toString('utf8')

    if (content !== decryptedContent) {
      throw new Error(
        `Mime section not correctly decrypted.\nExpected: '${content}'\nReceived: '${decryptedContent}'`
      )
    }
  })
})
