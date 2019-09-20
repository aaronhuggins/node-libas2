export class AS2MimePart {
  constructor (data: string | Uint8Array | Buffer, mimeType?: MimeType, name?: string, headers?: MimeHeaders, encoding?: '8bit' | 'binary' | 'base64') {
    this._data = data
    this._mimeType = mimeType
    this._name = name
    this._headers = headers
    this._encoding = encoding
    this._setDefaults()
  }

  readonly _data: string | Uint8Array | Buffer
  protected _mimeType: MimeType
  protected _name: string
  protected _headers: MimeHeaders
  protected _encoding: '8bit' | 'binary' | 'base64'
  protected Constants = {
    CONTROL_CHAR: '\r\n'
  }

  setName (name: string): void {
    this._name = name
  }

  setHeaders (headers: MimeHeaders): void {
    this._headers = headers
  }

  setEncoding (encoding: '8bit' | 'binary' | 'base64'): void {
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
      const guaranteedText = [
        'text/plain',
        'application/edi-x12',
        'application/EDI-X12',
        'application/edifact',
        'application/EDIFACT',
        'application/edi-consent',
        'application/EDI-Consent',
        'application/xml',
        'application/XML'
      ]
      const buffer = Buffer.from(this._data.buffer)

      if (guaranteedText.includes(contentType) && this._encoding !== 'base64') {
        content = buffer.toString('utf8')
      } else if (this._encoding === 'base64') {
        content = buffer.toString('base64')
      } else {
        content = buffer.toString('binary')
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
      ? 'text/plain'
      : this._mimeType
    this._headers = this._headers === undefined
      ? {}
      : this._headers
    this._encoding = this._encoding === undefined
      ? '8bit'
      : this._encoding
  }
}

export type MimeType =
'text/plain' |
'application/edi-x12' |
'application/EDI-X12' |
'application/edifact' |
'application/EDIFACT' |
'application/edi-consent' |
'application/EDI-Consent' |
'application/pkcs7-signature' |
'application/pkcs7-mime' |
'application/x-pkcs7-signature' |
'application/xml' |
'application/XML' |
'message/disposition-notification' |
'multipart/mixed' |
'multipart/report' |
'multipart/signed'

export interface MimeHeaders {
  'MIME-Version'?: '1.0'
  'mime-version'?: '1.0'
  'Content-Type'?: string
  'content-type'?: string
  'Content-Disposition'?: string
  'content-disposition'?: string
  'Content-Transfer-Encoding'?: '8bit' | 'binary' | 'base64'
  'content-transfer-encoding'?: '8bit' | 'binary' | 'base64'
}
