import { AS2ParserOptions, MailParserOptions } from './Interfaces'
import { AgreementOptions } from '../AS2Composer'
import { Stream } from 'stream'
import { AS2MimeNode } from '../AS2MimeNode'
// @ts-ignore
import parse from '@nhs-llc/emailjs-mime-parser'
// const parse = (buf: any) => {}

async function streamToBuffer (stream: Stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []

      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('error', (error) => reject(error))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    } catch (error) {
      reject(error)
    }
  })
}

function isStream (stream: any): boolean {
  return stream instanceof Stream || typeof stream.on === 'function'
}

function transformNodeLike (nodeLike: any, rootNode?: AS2MimeNode, parentNode?: AS2MimeNode): AS2MimeNode {
  const currentNode = new AS2MimeNode({
    filename: nodeLike.headers['content-disposition'] !== undefined
      ? nodeLike.headers['content-disposition'][0].params.filename
      : undefined,
    contentType: nodeLike.contentType.initial,
    headers: nodeLike.headers,
    content: nodeLike.content instanceof Uint8Array ? Buffer.from(nodeLike.content) : nodeLike.content,
  })

  if (!rootNode) rootNode = currentNode

  currentNode.rootNode = rootNode
  currentNode.parentNode = parentNode
  currentNode.raw = nodeLike.raw

  if (Array.isArray(nodeLike.childNodes)) {
    for (const childNode of nodeLike.childNodes) {
      const as2Node = transformNodeLike(childNode, rootNode, currentNode)

      currentNode.childNodes.push(as2Node)
    }
  }

  return currentNode
}

export class AS2Parser {
  constructor (options: AS2ParserOptions) {
    this._content = options.content
    this._agreement = options.agreement
  }

  private _agreement: AgreementOptions
  private _content: Buffer | Stream | string

  async parse (): Promise<AS2MimeNode> {
    if (isStream(this._content)) this._content = await streamToBuffer(this._content as Stream)
    const result = parse(this._content as Buffer)
    const as2node = transformNodeLike(result)

    return as2node
  }
}
