import * as http from 'http'
import { URL } from 'url'

export type AS2Headers =
  | Array<{
      key: string
      value: string | string[]
    }>
  | { [key: string]: string | string[] }

export type ParserHeaders = Map<
  string,
  | string
  | {
      value: string
      params: { [key: string]: string }
    }
>

export interface RequestOptions extends http.RequestOptions {
  url: string | URL
  body: string | Buffer
}

export interface IncomingMessage extends http.IncomingMessage {
  body?: string
  rawBody?: Buffer
}