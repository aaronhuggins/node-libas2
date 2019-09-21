import * as AS2Constants from './AS2Constants'
import { AS2MimePart } from './AS2MimePart'
import uuidv4 = require('uuid/v4')

export class AS2MimeMultipart {
  constructor (mime: AS2MimePart[], attachHeaders: boolean = true) {
    this._mime = mime
    this._attachHeaders = attachHeaders
    this._setBoundary()
    this._setHeaders()
  }

  readonly _mime: AS2MimePart[]
  protected _attachHeaders: boolean
  protected _boundary: string
  protected _headers: AS2Constants.MimeHeaders
  protected Constants = {
    MULTIPART_TYPE: AS2Constants.MULTIPART_TYPE.MIXED,
    CONTROL_CHAR: AS2Constants.CONTROL_CHAR
  }

  getMultipart (attachHeaders?: boolean): string {
    const multipart: string[] = []

    this._writeHeaders(multipart, attachHeaders)

    this._mime.forEach((mime) => {
      multipart.push(`--${this._boundary}`)
      multipart.push(mime.getMime())
    })

    multipart.push(`--${this._boundary}--`)
    multipart.push('')
    multipart.push('')

    return multipart.join(this.Constants.CONTROL_CHAR)
  }

  toString (attachHeaders?: boolean): string {
    return this.getMultipart()
  }

  protected _writeHeaders (multipart: string[], attachHeaders?: boolean): void {
    if (this._attachHeaders || attachHeaders) {
      Object.keys(this._headers).forEach((header) => {
        if (Object.prototype.hasOwnProperty.call(this._headers, header) as boolean) {
          multipart.push(`${header}: ${this._headers[header]}`)
        }
      })
      multipart.push('')
    }
  }

  protected _setBoundary (): void {
    this._boundary = `----${uuidv4().replace(/-/gu, '').toUpperCase()}`
  }

  protected _setHeaders (): void {
    this._headers = {
      'MIME-Version': AS2Constants.MIME_VERSION,
      'Content-Type': `${this.Constants.MULTIPART_TYPE}; boundary="${this._boundary}"`
    }
  }
}
