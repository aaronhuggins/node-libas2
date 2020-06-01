import { MailParser } from 'mailparser'
import { AS2ParserOptions, MailParserOptions } from './Interfaces'
import { AgreementOptions } from '../AS2Composer'
import { Stream } from 'stream'
import { AS2MimeNode, AS2MimeNodeOptions } from '../AS2MimeNode'
import { mapHeadersToNodeHeaders, isNullOrUndefined } from '../Helpers'
import { ParserHeaders } from '../Interfaces'

export class AS2Parser {
  constructor (options: AS2ParserOptions) {
    this._content = options.content
    this._agreement = options.agreement
    this._parser = options.parser
  }

  private _parser: MailParserOptions
  private _agreement: AgreementOptions
  private _content: Buffer | Stream | string

  stream (): MailParser {
    return new MailParser(this._parser)
  }

  async parse (): Promise<AS2MimeNode> {
    return new Promise((resolve, reject) => {
      let input = this._content
      const rootNodeOptions: AS2MimeNodeOptions = {}
      const childNodeOptions: AS2MimeNodeOptions[] = []

      let parser = this.stream()

      parser.on('error', err => {
        reject(err)
      })

      parser.on('headers', headers => {
        if (headers.has('content-disposition')) {
          const contentDisposition = (headers as ParserHeaders).get(
            'content-disposition'
          )

          if (typeof contentDisposition === 'string') {
            rootNodeOptions.contentDisposition = contentDisposition as
              | 'inline'
              | 'attachment'
          } else {
            rootNodeOptions.contentDisposition = contentDisposition.value as
              | 'inline'
              | 'attachment'
            rootNodeOptions.filename = contentDisposition.params.filename
          }
        }
        if (headers.has('content-type')) {
          const contentType = (headers as ParserHeaders).get('content-type')

          if (typeof contentType === 'string') {
            rootNodeOptions.contentType = contentType
          } else {
            rootNodeOptions.contentType = contentType.value
            if (rootNodeOptions.filename === undefined)
              rootNodeOptions.filename = contentType.params.name
          }
        }
        rootNodeOptions.headers = mapHeadersToNodeHeaders(
          headers as ParserHeaders
        )
      })

      let reading = false
      let reader = () => {
        reading = true

        let data = parser.read()

        if (data === null) {
          reading = false
          return
        }

        if (data.type === 'text') {
          /* const childNodeOption: any = {
            contentType: data.contentType,
            contentDisposition: data.contentDisposition,
            filename: data.filename,
            headers: mapHeadersToNodeHeaders(data.headers as ParserHeaders),
            text: data
          } */

          // childNodeOptions.push(childNodeOption)
          console.log(data)
        }

        if (data.type === 'attachment') {
          const childNodeOption: AS2MimeNodeOptions = {
            contentType: data.contentType,
            contentDisposition: data.contentDisposition,
            filename: data.filename,
            headers: mapHeadersToNodeHeaders(data.headers as ParserHeaders)
          }

          let chunks: any[] = []
          let chunklen = 0
          data.content.on('readable', () => {
            let chunk
            while ((chunk = data.content.read()) !== null) {
              chunks.push(chunk)
              chunklen += chunk.length
            }
          })

          data.content.on('end', () => {
            childNodeOption.content = Buffer.concat(chunks, chunklen)
            data.release()
            reader()
          })

          childNodeOptions.push(childNodeOption)
        } else {
          reader()
        }
      }

      parser.on('readable', () => {
        if (!reading) {
          reader()
        }
      })

      parser.on('end', () => {
        let rootNode = new AS2MimeNode(rootNodeOptions)
        console.log(childNodeOptions)
        childNodeOptions.forEach((childNodeOption, index) => {
          const childNode = new AS2MimeNode(childNodeOption)
          const rootMessageId = rootNode.getHeader('Message-ID')

          if (
            index === 0 &&
            !isNullOrUndefined(rootMessageId) &&
            childNode.getHeader('Message-ID') === rootMessageId
          ) {
            rootNode = childNode
          } else {
            rootNode.appendChild(childNode)
          }
        })

        resolve(rootNode)
      })

      if (typeof input === 'string') {
        parser.end(Buffer.from(input))
      } else if (Buffer.isBuffer(input)) {
        parser.end(input)
      } else {
        input
          .once('error', err => {
            ;(input as any).destroy()
            parser.destroy()
            reject(err)
          })
          .pipe(parser)
      }
    })
  }
}
