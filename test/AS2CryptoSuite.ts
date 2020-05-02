import 'mocha'
import { AS2Parser } from '../core'
import { cert, key, content } from './Helpers'
import { readFileSync } from 'fs'
import { SIGNING } from '../src/Constants'

const contentEncrypted = readFileSync('test/test-data/content.encrypted.txt')
const contentSigned = readFileSync('test/test-data/content.signed.txt')

describe('AS2Crypto', async () => {
  it('should decrypt contents of parsed mime message', async () => {
    const parser = new AS2Parser({ content: contentEncrypted })
    const result = await parser.parse()
    const decrypted = await result.decrypt({ cert, key })
    const decryptedContent = decrypted.content.toString('utf8')

    if (content !== decryptedContent) {
      throw new Error(
        `Mime section not correctly decrypted.\nExpected: '${content}'\nReceived: '${decryptedContent}'`
      )
    }
  })

  it('should verify signed contents of parsed mime message', async () => {
    const parser = new AS2Parser({ content: contentSigned })
    const result = await parser.parse()
    const verified = await result.verify({ cert, micalg: SIGNING.SHA256 })
    const verifiedContent = verified.content.toString('utf8')

    if (content !== verifiedContent) {
      throw new Error(
        `Mime section not correctly decrypted.\nExpected: '${content}'\nReceived: '${verifiedContent}'`
      )
    }
  })
})
