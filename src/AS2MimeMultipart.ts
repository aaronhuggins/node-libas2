import * as AS2Constants from './AS2Constants'
import { AS2MimePart } from './AS2MimePart'
import { v4 as uuidv4 } from 'uuid'

export class AS2MimeMultipart {
  constructor (
    content: AS2MimePart[],
    { attachHeaders = true, attachMessageId = true }: AS2MimeMultipartOptions
  ) {
    this._content = content
    this._attachHeaders = attachHeaders
    this._attachMessageId = attachMessageId
    this._setBoundary()
    this._setHeaders()
  }

  readonly _content: AS2MimePart[]
  protected _attachHeaders: boolean
  protected _attachMessageId: boolean
  protected _boundary: string
  protected _headers: AS2Constants.AS2Headers
  protected Constants = {
    MULTIPART_TYPE: AS2Constants.MULTIPART_TYPE.MIXED,
    CONTROL_CHAR: AS2Constants.CONTROL_CHAR
  }

  getHeaders (): AS2Constants.AS2Headers {
    return this._headers
  }

  toString (attachHeaders?: boolean): string {
    const multipart: string[] = []

    this._writeHeaders(multipart, attachHeaders)

    this._content.forEach(mime => {
      multipart.push(`--${this._boundary}`)
      multipart.push(mime.toString())
    })

    multipart.push(`--${this._boundary}--`)
    multipart.push('')
    multipart.push('')

    return multipart.join(this.Constants.CONTROL_CHAR)
  }

  protected _writeHeaders (multipart: string[], attachHeaders?: boolean): void {
    if (this._attachHeaders || attachHeaders) {
      Object.keys(this._headers).forEach(header => {
        if (
          Object.prototype.hasOwnProperty.call(this._headers, header) as boolean
        ) {
          multipart.push(`${header}: ${this._headers[header]}`)
        }
      })
      multipart.push('')
    }
  }

  protected _setBoundary (): void {
    this._boundary = `----${uuidv4()
      .replace(/-/gu, '')
      .toUpperCase()}`
  }

  protected _setHeaders (): void {
    this._headers = {
      'MIME-Version': AS2Constants.MIME_VERSION,
      'Content-Type': `${this.Constants.MULTIPART_TYPE}; boundary="${this._boundary}"`
    }

    if (this._attachMessageId) {
      this._headers['Message-ID'] = `<${uuidv4()
        .replace(/-/gu, '')
        .toUpperCase()}@libas2.node>`
    }
  }
}

export interface AS2MimeMultipartOptions {
  attachHeaders?: boolean
  attachMessageId?: boolean
}
