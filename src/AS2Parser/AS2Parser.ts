import { Stream } from 'stream'
import { AS2Headers } from '../Interfaces'
import { AS2MimeNode } from '../AS2MimeNode'
// @ts-ignore
import parse from '@nhs-llc/emailjs-mime-parser'

/** Class for parsing a MIME document to an AS2MimeNode tree. */
export class AS2Parser {
  private static isStream (stream: any): boolean {
    return stream instanceof Stream || typeof stream.on === 'function'
  }

  private static async streamToBuffer (stream: Stream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = []

        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', error => reject(error))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
      } catch (error) {
        reject(error)
      }
    })
  }

  private static transformParsedHeaders (headerObj: any): AS2Headers {
    const headers: AS2Headers = []

    for (const [key, value] of Object.entries(headerObj)) {
      for (const obj of value as any[]) {
        headers.push({
          key: key,
          value: obj.initial
        })
      }
    }

    return headers
  }

  private static transformNodeLike (
    nodeLike: any,
    rootNode?: AS2MimeNode,
    parentNode?: AS2MimeNode
  ): AS2MimeNode {
    const currentNode = new AS2MimeNode({
      filename:
        nodeLike.headers['content-disposition'] !== undefined
          ? nodeLike.headers['content-disposition'][0].params.filename
          : undefined,
      contentType: nodeLike.contentType.initial,
      headers: this.transformParsedHeaders(nodeLike.headers),
      content:
        nodeLike.content === undefined || this.isStream(nodeLike.content)
          ? nodeLike.content
          : Buffer.from(nodeLike.content),
      baseBoundary:
        nodeLike._multipartBoundary === false
          ? undefined
          : nodeLike._multipartBoundary,
      boundaryPrefix: ''
    })

    if (!rootNode) rootNode = currentNode

    currentNode.rootNode = rootNode
    currentNode.parentNode = parentNode
    currentNode.nodeCounter =
      typeof nodeLike.nodeCounter === 'object'
        ? nodeLike.nodeCounter.count
        : nodeLike.nodeCounter
    currentNode.parsed = true
    currentNode.raw = nodeLike.raw

    if (Array.isArray(nodeLike.childNodes)) {
      for (const childNode of nodeLike.childNodes) {
        const as2Node = this.transformNodeLike(childNode, rootNode, currentNode)

        currentNode.childNodes.push(as2Node)
      }
    }

    return currentNode
  }

  static async parse (content: Buffer | Stream | string): Promise<AS2MimeNode> {
    if (this.isStream(content))
      content = await this.streamToBuffer(content as Stream)
    const result = parse(content as Buffer)
    const as2node = this.transformNodeLike(result)

    return as2node
  }
}
