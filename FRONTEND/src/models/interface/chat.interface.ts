export interface Conversation {
  _id?: string
  sender_id: string
  receiver_id: string
  message: string
  created_at?: Date
  updated_at?: Date
}
export interface ConversationListConfig {
  limit?: number
  last_updated_at?: string
  last_message_id?: string
}
export interface Cursor {
  last_updated_at: string
  last_message_id: string
}
export interface ConversationResponse {
  cursor: Cursor
  data: Conversation[]
}
