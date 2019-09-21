import * as AS2Constants from './AS2Constants'

export class AS2MimePart {
  constructor (data: string | Uint8Array | Buffer, mimeType?: AS2Constants.MimeType, name?: string, headers?: AS2Constants.MimeHeaders, encoding?: AS2Constants.AS2Encoding) {
    this._data = data
    this._mimeType = mimeType
    this._name = name
    this._headers = headers
    this._encoding = encoding
    this._setDefaults()
  }

  readonly _data: string | Uint8Array | Buffer
  protected _mimeType: AS2Constants.MimeType
  protected _name: string
  protected _headers: AS2Constants.MimeHeaders
  protected _encoding: AS2Constants.AS2Encoding
  protected Constants = {
    CONTROL_CHAR: AS2Constants.CONTROL_CHAR
  }

  setName (name: string): void {
    this._name = name
  }

  setHeaders (headers: AS2Constants.MimeHeaders): void {
    this._headers = headers
  }

  setEncoding (encoding: AS2Constants.AS2Encoding): void {
    this._encoding = encoding
  }

  getMime (): string {
    const mime: string[] = []
    let contentType = `${this._mimeType}`
    let content = this._data

    if (this._headers['Content-Type'] !== undefined) {
      contentType = this._headers['Content-Type']
    } else if (this._headers['content-type'] !== undefined) {
      contentType = this._headers['content-type']
    }

    if (this._name !== undefined) {
      contentType = `${contentType}; name="${this._name}"`
    }

    mime.push(`Content-Type: ${contentType}`)

    Object.keys(this._headers).forEach((header) => {
      if (Object.prototype.hasOwnProperty.call(this._headers, header) as boolean && header.toLowerCase() !== 'content-type' && header.toLowerCase() !== 'content-transfer-encoding') {
        mime.push(`${header}: ${this._headers[header]}`)
      }
    })

    mime.push(`Content-Transfer-Encoding: ${this._encoding}`)
    mime.push('')

    if (typeof this._data !== 'string') {
      const buffer = Buffer.from(this._data.buffer)

      if (AS2Constants.GUARANTEED_TEXT.includes(contentType) && this._encoding !== AS2Constants.ENCODING.BASE64) {
        content = buffer.toString('utf8')
      } else if (this._encoding === AS2Constants.ENCODING.BASE64) {
        content = buffer.toString(AS2Constants.ENCODING.BASE64)
      } else {
        content = buffer.toString(AS2Constants.ENCODING.BINARY)
      }
    }

    mime.push(content as string)

    return mime.join(this.Constants.CONTROL_CHAR)
  }

  toString (): string {
    return this.getMime()
  }

  private _setDefaults (): void {
    this._mimeType = this._mimeType === undefined
      ? 'text/plain' as AS2Constants.MimeType
      : this._mimeType
    this._headers = this._headers === undefined
      ? {}
      : this._headers
    this._encoding = this._encoding === undefined
      ? '8bit'
      : this._encoding
  }
}
