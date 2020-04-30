import { MailParser } from 'mailparser'
import { AS2ParserOptions, MailParserOptions } from './Interfaces'
import { AgreementOptions } from '../AS2Composer'
import { Stream } from 'stream'
import { AS2MimeNode } from '../AS2MimeNode'

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
      let options: boolean | MailParserOptions = this._parser
      let rootNode: AS2MimeNode

      options = options || ({} as MailParserOptions)
      let keepCidLinks = !!options.keepCidLinks

      let mail: any = {
        attachments: [] as any[]
      }

      let parser = new MailParser(options)

      parser.on('error', err => {
        reject(err)
      })

      parser.on('headers', headers => {
        mail.headers = headers
        mail.headerLines = (parser as any).headerLines
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
          Object.keys(data).forEach(key => {
            if (['text', 'html', 'textAsHtml'].includes(key)) {
              mail[key] = data[key]
            }
          })
        }

        if (data.type === 'attachment') {
          mail.attachments.push(data)

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
            data.content = Buffer.concat(chunks, chunklen)
            data.release()
            reader()
          })
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
        ;[
          'subject',
          'references',
          'date',
          'to',
          'from',
          'to',
          'cc',
          'bcc',
          'message-id',
          'in-reply-to',
          'reply-to'
        ].forEach(key => {
          if (mail.headers.has(key)) {
            mail[
              key.replace(/-([a-z])/g, (m, c) => c.toUpperCase())
            ] = mail.headers.get(key)
          }
        })

        if (keepCidLinks) {
          resolve(mail)
        }
        ;(parser as any).updateImageLinks(
          (attachment: any, done: Function) =>
            done(
              false,
              'data:' +
                attachment.contentType +
                ';base64,' +
                attachment.content.toString('base64')
            ),
          (err: any, html: string) => {
            if (err) {
              reject(err)
              return
            } else {
              mail.html = html

              resolve(mail)
              return
            }
          }
        )
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

      resolve(mail)
    })
  }
}
