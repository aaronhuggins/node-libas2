import * as cp from 'child_process'
import { readFileSync } from 'fs'

export const content = readFileSync('test/test-data/sample_edi.edi', 'utf8')
export const cert = readFileSync('test/test-data/sample_cert.cer', 'utf8')
export const key = readFileSync('test/test-data/sample_priv.key', 'utf8')

export const run = async function run (command: string): Promise<string> {
  return new Promise((resolve, reject) => {
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
