import * as http from 'http'
import * as https from 'https'
import { URL } from 'url'
import { AgreementOptions } from './AS2Composer'
import { SIGNING, ENCRYPTION } from './Constants'
import { AS2MimeNode } from './AS2MimeNode'
import { SigningOptions, EncryptionOptions } from './AS2Crypto'
import { AS2Headers, ParserHeaders, RequestOptions, IncomingMessage } from './Interfaces'
import { Socket } from 'net'
import { AS2Parser } from './AS2Parser'

export const getProtocol = function (url: string | URL) {
  if (typeof url === 'string') return url.toLowerCase().split(/:/gu)[0]
  if (url instanceof URL) return url.protocol.toLowerCase().replace(/:/gu, '')
  throw new Error('URL is not one of either "string" or instance of "URL".')
}

/** Convenience method for null-checks */
export const isNullOrUndefined = function isNullOrUndefined (
  value: any
): boolean {
  return value === undefined || value === null
}

export const isSMime = function isSMime (value: string) {
  return (
    value.toLowerCase().startsWith('application/pkcs7') ||
    value.toLowerCase().startsWith('application/x-pkcs7')
  )
}

/** Transforms a payload into a canonical text format before signing */
export const canonicalTransform = function canonicalTransform (
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

export const mapHeadersToNodeHeaders = function mapHeadersToNodeHeaders (
  headers: ParserHeaders
): AS2Headers {
  const result: AS2Headers = []

  headers.forEach((value, key) => {
    if (
      typeof value === 'string' ||
      typeof (value as any).getDate === 'function'
    ) {
      result.push({
        key,
        value: value as string
      })
    } else {
      const obj = value
      if (key === 'content-type' && typeof obj.params.name === 'string') {
        delete obj.params.name
      }
      const params = Array.from(Object.entries(obj.params)).map(
        param => `${param[0]}=${param[1]}`
      )

      result.push({
        key,
        value: [obj.value, ...params].join('; ')
      })
    }
  })

  return result
}

/** Normalizes certificate signing options. */
export const signingOptions = function signingOptions (
  sign: SigningOptions
): SigningOptions {
  return { cert: '', key: '', chain: [], micalg: SIGNING.SHA256, ...sign }
}

/** Normalizes encryption options. */
export const encryptionOptions = function encryptionOptions (
  encrypt: EncryptionOptions
): EncryptionOptions {
  return { cert: '', encryption: ENCRYPTION._3DES, ...encrypt }
}

/** Normalizes agreement options. */
export const agreementOptions = function agreementOptions (
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

/** Convenience method for making AS2 HTTP/S requests. */
export async function request (
  options: RequestOptions
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    try {
      const { body, url } = options
      const protocol = getProtocol(url) === 'https' ? https : http
      delete options.body
      delete options.url
      options.method = 'POST'
      let responseBufs: Buffer[] = []
      const req = protocol.request(url, options, (response: IncomingMessage) => {
        // We dispose of the body data, but read the stream so we can collect the raw response.
        response.on('data', () => {})
        response.on('error', error => reject(error))
        response.on('end', () => {
          const rawResponse = Buffer.concat(responseBufs)
          response.rawResponse = rawResponse
          response.parsed = AS2Parser.parse(rawResponse)
          resolve(response)
        })
      })
      req.on('error', error => reject(error))
      req.on('socket', (socket: Socket) => {
        socket.on('data', (data: Buffer) => {
          responseBufs.push(data)
        })
      })
      req.write(body)
      req.end()
    } catch (error) {
      reject(error)
    }
  })
}
