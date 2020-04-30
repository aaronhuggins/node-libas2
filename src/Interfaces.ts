export type AS2Headers =
  | Array<{
      key: string
      value: string | string[]
    }>
  | { [key: string]: string | string[] }
