import * as cp from 'child_process'
import { readFileSync } from 'fs'

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

export const run = async function run (
  command: string,
  args?: string[] | Buffer,
  input?: Buffer
): Promise<string> {
  if (Buffer.isBuffer(args) && input === undefined) {
    input = args
    args = undefined
  }
  return new Promise((resolve, reject) => {
    const output: Buffer[] = []
    const error: Buffer[] = []
    const child = cp.spawn(command, Array.isArray(args) ? args : undefined)

    if (input !== undefined) child.stdin.end(input)
    child.stdout.on('data', (data: Buffer) => output.push(data))
    child.stderr.on('data', (data: Buffer) => error.push(data))
    child.on('close', () => {
      if (error.length > 0) {
        const [message, ...stack] = error
        const rejected = new Error(message.toString('utf8').trim())
        rejected.stack = stack.join('')
        reject(rejected)
      } else {
        resolve(output.join(''))
      }
    })
    child.on('error', (err: Error) => reject(err))
  })
}

export async function openssl (options: {
  command: string
  input?: Buffer
  arguments?: { [key: string]: string | boolean }
}): Promise<string>
export async function openssl (options: {
  command: string
  input?: Buffer
  arguments?: { verify: true; [key: string]: string | boolean }
}): Promise<boolean>
export async function openssl (options: {
  command: string
  input?: Buffer
  arguments?: { [key: string]: string | boolean }
}): Promise<string | boolean> {
  const args = [options.command]

  if (options.arguments !== undefined) {
    new Map(Object.entries(options.arguments)).forEach((value, key) => {
      if (typeof value === 'string') {
        args.push('-' + key, value)
      } else if (value === true) {
        args.push('-' + key)
      }
    })
  }

  try {
    return normalizeLineBreaks(await run('openssl', args, options.input))
  } catch (error) {
    if (options.arguments.verify === true) {
      return error.message.toLowerCase() === 'verification successful'
    }
    throw error
  }
}

export const LIBAS2_EDI_PATH = 'test/test-data/sample_edi.edi'
export const LIBAS2_CERT_PATH = 'test/test-data/libas2community.cer'
export const LIBAS2_KEY_PATH = 'test/test-data/libas2community.key'
export const LIBAS2_EDI = readFileSync(LIBAS2_EDI_PATH, 'utf8')
export const LIBAS2_CERT = readFileSync(LIBAS2_CERT_PATH, 'utf8')
export const LIBAS2_KEY = readFileSync(LIBAS2_KEY_PATH, 'utf8')
export const AS2_TESTING_CERT = readFileSync(
  'test/test-data/as2Testing.cer',
  'utf8'
)
// Normalize line breaks for test files; original environment saved the files as crlf.
export const ENCRYPTED_CONTENT = normalizeLineBreaks(
  readFileSync('test/test-data/content.encrypted.txt', 'utf8')
)
export const SIGNED_CONTENT = normalizeLineBreaks(
  readFileSync('test/test-data/content.signed.txt', 'utf8')
)
export const SIGNED_MDN = normalizeLineBreaks(
  readFileSync('test/test-data/mdn.signed.txt', 'utf8')
)
