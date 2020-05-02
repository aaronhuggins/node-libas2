import * as cp from 'child_process'
import { readFileSync } from 'fs'
import * as http from 'http'
import * as https from 'https'
import { URL } from 'url'

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

const run = async function run (
  command: string,
  chunk?: Buffer
): Promise<string> {
  return new Promise((resolve, reject) => {
    const output: string[] = []
    const error: string[] = []
    const child = cp.exec(command)

    child.stdin.end(chunk, 'utf8')
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
  input?: Buffer
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

  return normalizeLineBreaks(await run(openssl.join(' '), options.input))
}

interface RequestOptions extends http.RequestOptions {
  url: string | URL
  body: string | Buffer
}

interface IncomingMessage extends http.IncomingMessage {
  body?: string
  rawBody?: Buffer
}

const getProtocol = function (url: string | URL) {
  if (typeof url === 'string') return url.toLowerCase().split(/:/gu)[0]
  if (url instanceof URL) return url.protocol.toLowerCase().replace(/:/gu, '')
  throw new Error('URL is not one of either "string" or instance of "URL".')
}

export async function request (options: RequestOptions): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const { body, url } = options
    const protocol = getProtocol(url) === 'https' ? https : http
    delete options.body
    delete options.url
    const req = protocol.request(url, options, (response: IncomingMessage) => {
      let rawBody = Buffer.from('')

      response.on('error', (error) => reject(error))
      response.on('data', (data: Buffer) => {
        rawBody = Buffer.concat([rawBody, data])
      })
      response.on('end', () => {
        response.rawBody = rawBody
        resolve(response)
      })
    })
    req.on('error', (error) => reject(error))
    req.write(body)
    req.end()
  })
}