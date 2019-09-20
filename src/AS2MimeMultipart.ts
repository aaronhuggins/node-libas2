import { AS2MimeSection, MimeHeaders } from './AS2MimeSection'

export class AS2MimeMultipart {
  constructor (mime: AS2MimeSection[], useHeaders: boolean = true) {
    this._mime = mime
    this._useHeaders = useHeaders
    this._setBoundary()
    this._setHeaders()
  }

  readonly uuidv4 = require('uuid/v4')
  readonly _mime: AS2MimeSection[]
  readonly _useHeaders: boolean
  protected _boundary: string
  protected _headers: MimeHeaders
  protected Constants = {
    MULTIPART_TYPE: 'multipart/mixed',
    CONTROL_CHAR: '\r\n'
  }

  getMultipart (): string {
    const multipart: string[] = []

    if (this._useHeaders) {
      Object.keys(this._headers).forEach((header) => {
        if (Object.prototype.hasOwnProperty.call(this._headers, header) as boolean) {
          multipart.push(`${header}: ${this._headers[header]}`)
        }
      })
      multipart.push('')
    }

    this._mime.forEach((mime) => {
      multipart.push(this._boundary)
      multipart.push(mime.getMime())
    })

    multipart.push(this._boundary)
    multipart.push('')

    return multipart.join(this.Constants.CONTROL_CHAR)
  }

  toString (): string {
    return this.getMultipart()
  }

  protected _setBoundary (): void {
    this._boundary = `----${this.uuidv4().replace(/-/gu, '').toUpperCase()}`
  }

  protected _setHeaders (): void {
    this._headers = {
      'MIME-Version': '1.0',
      'Content-Type': `${this.Constants.MULTIPART_TYPE}; boundary="${this._boundary}"`
    }
  }
}
