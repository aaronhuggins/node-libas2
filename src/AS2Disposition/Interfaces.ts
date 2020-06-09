import { AS2MimeNode } from '../AS2MimeNode'
import { AS2DispositionNotification } from './AS2DispositionNotification'

export interface AS2DispositionOptions {
  explanation: string
  notification: AS2DispositionNotification
  returned: AS2MimeNode
}
