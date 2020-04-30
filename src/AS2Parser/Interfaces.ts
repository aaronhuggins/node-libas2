import { Stream, TransformOptions } from 'stream'
import { AgreementOptions } from '../AS2Composer'

export interface AS2ParserOptions {
  content: Buffer | Stream | string
  parser?: MailParserOptions
  agreement?: AgreementOptions
}

export interface MailParserOptions extends TransformOptions {
  skipHtmlToText: boolean
  maxHtmlLengthToParse: number
  formatDateString: Function
  skipImageLinks: boolean
  skipTextToHtml: boolean
  skipTextLinks: boolean
  Iconv: any
  keepCidLinks: boolean
}
