export interface AS2DispositionNotification {
  'reporting-ua'?: NotificationValue
  'mdn-gateway'?: NotificationValue
  'original-recipient'?: NotificationValue
  'final-recipient'?: NotificationValue
  'original-message-id'?: NotificationValue
  disposition?: NotificationValue
  warning?: NotificationValue
  failure?: NotificationValue
  error?: NotificationValue
  [key: string]: NotificationValue
}

export interface NotificationValue {
  value?: string
  attributes?: { [key: string]: string }
  original?: string
  type?: string
}
