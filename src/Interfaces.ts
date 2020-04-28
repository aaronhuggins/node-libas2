export type AS2Headers =
  | Array<{
      key: string
      value: string
    }>
  | { [key: string]: string }
