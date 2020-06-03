import 'mocha'
import { AS2Parser } from '../core'
import {
  LIBAS2_CERT,
  LIBAS2_KEY,
  LIBAS2_EDI,
  openssl,
  LIBAS2_CERT_PATH
} from './Helpers'
import { readFileSync } from 'fs'
import { SIGNING } from '../src/Constants'
import { createSign, createVerify } from 'crypto'
import { AS2Crypto } from '../src/AS2Crypto'

const contentEncrypted = readFileSync('test/test-data/content.encrypted.txt')
const contentSigned = readFileSync('test/test-data/content.signed.txt')

describe('AS2Crypto', async () => {
  it('should decrypt contents of parsed mime message', async () => {
    const result = await AS2Parser.parse(contentEncrypted)
    const decrypted = await result.decrypt({
      cert: LIBAS2_CERT,
      key: LIBAS2_KEY
    })
    const decryptedContent = decrypted.content.toString('utf8')

    if (decryptedContent !== LIBAS2_EDI) {
      throw new Error(
        `Mime section not correctly decrypted.\nExpected: '${LIBAS2_EDI}'\nReceived: '${decryptedContent}'`
      )
    }
  })

  it('should verify signed contents of parsed mime message', async () => {
    const result = await AS2Parser.parse(contentSigned)
    const verified = await AS2Crypto.verify(
      result,
      { cert: LIBAS2_CERT }
    )

    if (verified === null) {
      throw new Error('Mime section could not be verified.')
    }
  })
})
