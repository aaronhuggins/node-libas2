import { AS2MimeNode } from '../AS2MimeNode'

export interface AS2DispositionOptions {
  explanation: string
  notification: AS2DispositionNotification & {
    'reporting-ua': NotificationValue
    'original-recipient': NotificationValue
    'final-recipient': NotificationValue
    'original-message-id': NotificationValue
    disposition: NotificationValue
    'received-content-mic': NotificationValue
  }
  returned: AS2MimeNode
}

export interface AS2DispositionNotification {
  'reporting-ua'?: NotificationValue
  'mdn-gateway'?: NotificationValue
  'original-recipient'?: NotificationValue
  'final-recipient'?: NotificationValue
  'original-message-id'?: NotificationValue
  disposition?: NotificationValue & {
    value: string
    attributes: {
      processed: true | {
        warning?: string
        error?: string
        failure?: string
      }
    }
    type: 'automatic-action'
  }
  'received-content-mic'?: NotificationValue
  warning?: NotificationValue
  failure?: NotificationValue
  error?: NotificationValue
  [key: string]: NotificationValue
}

export interface NotificationValue {
  value?: string
  attributes?: { [key: string]: any }
  original: string
  type?: string
}
