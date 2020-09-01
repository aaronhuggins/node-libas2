import * as http from 'http'
import * as https from 'https'
import { AgreementOptions, AS2Agreement } from './AS2Composer'
import { AS2Constants } from './Constants'
import { AS2MimeNode } from './AS2MimeNode'
import { SigningOptions, EncryptionOptions } from './AS2Crypto'
import { RequestOptions, IncomingMessage } from './Interfaces'
import { Socket } from 'net'
import { AS2Parser } from './AS2Parser'

const { SIGNING, ENCRYPTION, CRLF } = AS2Constants

/** Get the multipart/report disposition-notification, if any.
 * @param {AS2MimeNode} node - The multipart MIME containing the report.
 * @returns {AS2MimeNode} The multipart/report disposition-notification.
 */
export function getReportNode (node: AS2MimeNode): AS2MimeNode {
  if (!node) return

  if (
    node.contentType &&
    node.contentType.includes('multipart/report') &&
    node.contentType.includes('disposition-notification')
  ) {
    return node
  }

  for (const childNode of node.childNodes || []) {
    return getReportNode(childNode)
  }
}

/** Answers if the AS2MimeNode is a Message Disposition Notification.
 * @param {AS2MimeNode} node - The multipart MIME which may contain a report.
 * @returns {boolean} True for a Message Disposition Notification.
 */
export function isMdn (node: AS2MimeNode): boolean {
  return typeof getReportNode(node) !== 'undefined'
}

/** Method for converting a string of headers into key:value pairs.
 * @param {string} headers - A string of headers.
 * @param {boolean|Function} [keyToLowerCase] - Set all header keys to lower-case; or provide a function to manipulate values.
 * @param {Function} [callback] - A callback to manipulate values as they are parsed; only use if second argument is a boolean.
 * @returns {object} The headers as an object of key/value pairs.
 */
export function parseHeaderString (headers: string): { [key: string]: string | string[] }
export function parseHeaderString (headers: string, keyToLowerCase: boolean): { [key: string]: string | string[] }
export function parseHeaderString (
  headers: string,
  callback: (key: string, value: string) => [string, any]
): { [key: string]: any }
export function parseHeaderString (
  headers: string,
  keyToLowerCase: boolean,
  callback: (key: string, value: string) => [string, any]
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
  if (!callback) callback = (key: string, value: string) => [key, value]

  // Unfold header lines, split on newline, and trim whitespace from strings.
  const lines = headers
    .trim()
    .replace(/(\r\n|\n\r|\n)( |\t)/gu, ' ')
    .split(/\n/gu)
    .map(line => line.trim())

  // Assign one or more values to each header key.
  for (const line of lines) {
    const index = line.indexOf(':')
    let [key, value] = callback(line.slice(0, index).trim(), line.slice(index + 1).trim())

    if (keyToLowerCase) key = key.toLowerCase()

    if (result[key] === undefined) {
      result[key] = value
    } else if (Array.isArray(result[key])) {
      result[key].push(value)
    } else {
      result[key] = [result[key], value]
    }
  }

  return result
}

/** Method for retrieving the protocol of a URL, dynamically.
 * @param {string|URL} url - The url to get the protocol.
 * @returns {string} The protocol of the URL.
 * @throws URL is not one of either "string" or instance of "URL".
 */
export function getProtocol (url: string | URL): string {
  if (typeof url === 'string' || url instanceof URL) {
    return new URL(url as string).protocol.replace(':', '')
  }

  throw new Error('URL is not one of either "string" or instance of "URL".')
}

/** Convenience method for null-checks.
 * @param {any} value - Any value to duck-check.
 * @returns {boolean} True if null or undefined.
 */
export function isNullOrUndefined (value: any): boolean {
  return value === undefined || value === null
}

/** Determine if a given string is one of PKCS7 MIME types.
 * @param {string} value - Checks if either pkcs7 or x-pkcs7.
 * @returns {boolean} True if a valid pkcs7 value.
 */
export function isSMime (value: string) {
  return value.toLowerCase().startsWith('application/pkcs7') || value.toLowerCase().startsWith('application/x-pkcs7')
}

/** Transforms a payload into a canonical text format per RFC 5751 section 3.1.1.
 * @param {AS2MimeNode} node - The AS2MimeNode to canonicalize.
 */
export function canonicalTransform (node: AS2MimeNode): void {
  const newline = /\r\n|\r|\n/gu

  if (node.getHeader('content-type').slice(0, 5) === 'text/' && !isNullOrUndefined(node.content)) {
    node.content = (node.content as string).replace(newline, CRLF)
  }

  node.childNodes.forEach(canonicalTransform)
}

/** Normalizes certificate signing options.
 * @param {SigningOptions} sign - Options for signing.
 * @returns {SigningOptions} A normalized option object.
 */
export function getSigningOptions (sign: SigningOptions): SigningOptions {
  return { cert: '', key: '', algorithm: SIGNING.SHA256, ...sign }
}

/** Normalizes encryption options.
 * @param {EncryptionOptions} encrypt - Options for encryption.
 * @returns {EncryptionOptions} A normalized option object.
 */
export function getEncryptionOptions (encrypt: EncryptionOptions): EncryptionOptions {
  return { cert: '', encryption: ENCRYPTION.AES256_CBC, ...encrypt }
}

/** Normalizes agreement options.
 * @param {AgreementOptions} agreement - Options for partner agreement.
 * @returns {AS2Agreement} A normalized option object.
 */
export function getAgreementOptions (agreement: AgreementOptions): AS2Agreement {
  return new AS2Agreement(agreement as any)
}

/** Convenience method for making AS2 HTTP/S requests. Makes a POST request by default.
 * @param {RequestOptions} options - Options for making a request; extends Node's RequestOptions interface.
 * @param {Buffer|string|object|Array} options.body - Buffer, string, or JavaScript object.
 * @param {object} options.params - JavaScript object of parameters to append to the url.
 * @returns {IncomingMessage} The incoming message, including Buffer properties rawBody and rawResponse,
 * and convenience methods for mime() and json().
 */
export async function request (options: RequestOptions): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    try {
      const { body, params, url } = options
      const internalUrl = new URL(url as string)
      const internalBody = isNullOrUndefined(body) ? '' : body
      const protocol = getProtocol(internalUrl) === 'https' ? https : http
      delete options.body
      delete options.params
      delete options.url
      options.method = options.method || 'POST'
      Object.entries(params || {}).forEach(val => {
        if (!isNullOrUndefined(val[1])) {
          internalUrl.searchParams.append(...(val as [string, any]))
        }
      })
      const responseBufs: Buffer[] = []
      const req = protocol.request(internalUrl, options, (response: IncomingMessage) => {
        const bodyBufs: Buffer[] = []

        response.on('data', (data: Buffer) => bodyBufs.push(data))
        response.on('error', error => reject(error))
        response.on('end', () => {
          const rawResponse = Buffer.concat(responseBufs)
          const rawBody = Buffer.concat(bodyBufs)
          response.rawBody = rawBody
          response.rawResponse = rawResponse
          response.mime = async () => {
            return await AS2Parser.parse(
              rawResponse.length > 0
                ? rawResponse
                : {
                    headers: response.rawHeaders,
                    content: rawBody
                  }
            )
          }
          response.json = function json () {
            try {
              return JSON.parse(rawBody.toString('utf8'))
            } catch (err) {
              return err
            }
          }
          resolve(response)
        })
      })
      req.on('error', error => reject(error))
      req.on('socket', (socket: Socket) => {
        socket.on('data', (data: Buffer) => responseBufs.push(data))
      })
      req.write(internalBody)
      req.end()
    } catch (error) {
      reject(error)
    }
  })
}
