import * as http from 'http'
import * as https from 'https'
import { URL } from 'url'
import { AgreementOptions } from './AS2Composer'
import { SIGNING, ENCRYPTION } from './Constants'
import { AS2MimeNode } from './AS2MimeNode'
import { SigningOptions, EncryptionOptions } from './AS2Crypto'
import { RequestOptions, IncomingMessage } from './Interfaces'
import { Socket } from 'net'
import { AS2Parser } from './AS2Parser'

/** Method for converting a string of headers into key:value pairs. */
export function parseHeaderString (
  headers: string
): { [key: string]: string | string[] }
export function parseHeaderString (
  headers: string,
  keyToLowerCase: boolean
): { [key: string]: string | string[] }
export function parseHeaderString (
  headers: string,
  callback: (value: string) => any
): { [key: string]: any }
export function parseHeaderString (
  headers: string,
  keyToLowerCase: boolean,
  callback: (value: string) => any
): { [key: string]: any }
export function parseHeaderString (
  headers: string,
  keyToLowerCase: boolean | Function = false,
  callback?: Function
): { [key: string]: any } {
  const result = {}

  if (!headers) return result
  if (typeof keyToLowerCase === 'function') {
    callback = keyToLowerCase
    keyToLowerCase = false
  }
  if (!callback) callback = (value: string) => value

  // Unfold header lines, split on newline, and trim whitespace from strings.
  const lines = headers
    .trim()
    .replace(/(\r\n|\n\r|\n)( |\t)/gu, ' ')
    .split(/\n/gu)
    .map(line => line.trim())

  // Assign one or more values to each header key.
  for (const line of lines) {
    const index = line.indexOf(':')
    let key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()

    if (keyToLowerCase) key = key.toLowerCase()

    if (result[key] === undefined) {
      result[key] = callback(value)
    } else if (Array.isArray(result[key])) {
      result[key].push(callback(value))
    } else {
      result[key] = [result[key], callback(value)]
    }
  }

  return result
}

export function getProtocol (url: string | URL): string {
  if (typeof url === 'string' || url instanceof URL) {
    return new URL(url as string).protocol.replace(':', '')
  }

  throw new Error('URL is not one of either "string" or instance of "URL".')
}

/** Convenience method for null-checks */
export function isNullOrUndefined (value: any): boolean {
  return value === undefined || value === null
}

export function isSMime (value: string) {
  return (
    value.toLowerCase().startsWith('application/pkcs7') ||
    value.toLowerCase().startsWith('application/x-pkcs7')
  )
}

/** Transforms a payload into a canonical text format before signing */
export function canonicalTransform (
  node: AS2MimeNode
): void {
  const newline = /\r\n|\r|\n/g

  if (
    node.getHeader('content-type').slice(0, 5) === 'text/' &&
    !isNullOrUndefined(node.content)
  ) {
    node.content = (node.content as string).replace(newline, '\r\n')
  }

  node.childNodes.forEach(canonicalTransform)
}

/** Normalizes certificate signing options. */
export function signingOptions (sign: SigningOptions): SigningOptions {
  return { cert: '', key: '', chain: [], micalg: SIGNING.SHA256, ...sign }
}

/** Normalizes encryption options. */
export function encryptionOptions (
  encrypt: EncryptionOptions
): EncryptionOptions {
  return { cert: '', encryption: ENCRYPTION._3DES, ...encrypt }
}

/** Normalizes agreement options. */
export function agreementOptions (
  agreement: AgreementOptions
): AgreementOptions {
  const { mdn } = agreement
  const { sign } = mdn

  return {
    version: '1.0',
    ...agreement,
    mdn: isNullOrUndefined(mdn)
      ? mdn
      : {
          ...mdn,
          sign: isNullOrUndefined(sign)
            ? sign
            : {
                importance: 'required',
                protocol: 'pkcs7-signature',
                ...sign
              }
        }
  }
}

/** Convenience method for making AS2 HTTP/S requests. Makes a POST request by default. */
export async function request (
  options: RequestOptions
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    try {
      const { params } = options
      let { body, url } = options
      url = new URL(url as string)
      body = isNullOrUndefined(body) ? '' : body
      const protocol = getProtocol(url) === 'https' ? https : http
      delete options.body
      delete options.url
      options.method = options.method || 'POST'
      Object.entries(params || {}).forEach(val => (url as URL).searchParams.append(...val))
      const responseBufs: Buffer[] = []
      const req = protocol.request(
        url,
        options,
        (response: IncomingMessage) => {
          const bodyBufs: Buffer[] = []

          response.on('data', (data: Buffer) => bodyBufs.push(data))
          response.on('error', error => reject(error))
          response.on('end', () => {
            const rawResponse = Buffer.concat(responseBufs)
            const rawBody = Buffer.concat(bodyBufs)
            response.rawBody = rawBody
            response.rawResponse = rawResponse
            response.mime = () => AS2Parser.parse(rawResponse)
            response.json = function json () {
              try {
                return JSON.parse(rawBody.toString('utf8'))
              } catch (err) {
                return err
              }
            }
            resolve(response)
          })
        }
      )
      req.on('error', error => reject(error))
      req.on('socket', (socket: Socket) => {
        socket.on('data', (data: Buffer) => responseBufs.push(data))
      })
      req.write(body)
      req.end()
    } catch (error) {
      reject(error)
    }
  })
}
