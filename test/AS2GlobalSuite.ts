import { ImportMock } from 'ts-mock-imports'
import { getPackageJson, request } from '../core'
import * as fs from 'fs'
import * as assert from 'assert'
import * as nock from 'nock'

describe('Globals for libas2', () => {
  it('should return empty package json', async () => {
    const mockManager = ImportMock.mockFunction(fs, 'readFileSync')
    const pkg = getPackageJson()

    mockManager.restore()

    assert.deepStrictEqual(pkg, {})
  })

  it('should make requests', async () => {
    const payload: any = { tested: null }

    const scope = nock('http://local.host')

    scope.post(uri => uri.startsWith('/fake')).reply(200, payload)
    scope.post(uri => uri.startsWith('/fake')).reply(200, 'payload')

    const response = await request({
      url: 'http://local.host/fake',
      params: {
        test1: 1,
        test2: null
      }
    })
    const response2 = await request({ url: 'http://local.host/fake' })

    assert.deepStrictEqual(response.json(), payload)
    assert.strictEqual(response2.json() instanceof Error, true)
  })
})
