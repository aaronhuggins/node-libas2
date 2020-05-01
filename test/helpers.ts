import * as cp from 'child_process'
import { readFileSync } from 'fs'

export const content = readFileSync('test/test-data/sample_edi.edi', 'utf8')
export const cert = readFileSync('test/test-data/sample_cert.cer', 'utf8')
export const key = readFileSync('test/test-data/sample_priv.key', 'utf8')

export const normalizeLineBreaks = function normalizeLineBreaks (
  input: string
) {
  const lines = input.split(/\r\n|\n\r|\n/gu)
  const output = []

  for (let line of lines) {
    if (line.endsWith('\r')) {
      line = line.substring(0, line.length - 1)
    }
    output.push(line)
  }

  return output.length > 0 ? output.join('\r\n') : input
}

const run = async function run (command: string): Promise<string> {
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

export async function openssl (options: {
  command: string
  arguments?: { [key: string]: string | boolean }
}) {
  const openssl = ['openssl', options.command]

  if (options.arguments !== undefined) {
    new Map(Object.entries(options.arguments)).forEach((value, key) => {
      if (typeof value === 'string') {
        openssl.push('-' + key, value)
      } else {
        openssl.push('-' + key)
      }
    })
  }

  return normalizeLineBreaks(await run(openssl.join(' ')))
}
