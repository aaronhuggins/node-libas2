import 'mocha'
import { AS2Parser, AS2Crypto } from '../core'
import {
  LIBAS2_CERT,
  LIBAS2_KEY,
  LIBAS2_EDI,
  ENCRYPTED_CONTENT,
  SIGNED_CONTENT
} from './Helpers'

describe('AS2Crypto', async () => {
  it('should decrypt contents of parsed mime message', async () => {
    const result = await AS2Parser.parse(ENCRYPTED_CONTENT)
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
    const result = await AS2Parser.parse(SIGNED_CONTENT)
    const verified = await AS2Crypto.verify(result, { cert: LIBAS2_CERT })

    if (!verified) {
      throw new Error('Mime section could not be verified.')
    }
  })
})
