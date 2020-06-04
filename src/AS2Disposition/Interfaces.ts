export interface AS2DispositionNotification {
  'reporting-ua'?: string
  'mdn-gateway'?: string
  'original-recipient'?: string
  'final-recipient'?: string
  'original-message-id'?: string
  'disposition'?: string
  'warning'?: string
  'failure'?: string
  'error'?: string
  [key: string]: string | string[]
}
