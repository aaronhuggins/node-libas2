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
