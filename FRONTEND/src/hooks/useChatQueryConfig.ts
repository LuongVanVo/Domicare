import { ConversationListConfig } from '@/models/interface/chat.interface'
import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { useSearchParams } from 'react-router-dom'

export type QueryChatConfig = {
  [key in keyof ConversationListConfig]: string
}
export const useParamsString = () => {
  const [searchParams] = useSearchParams()
  return Object.fromEntries(searchParams.entries())
}
export const useChatQueryConfig = () => {
  const queryString: QueryChatConfig = useParamsString()
  const queryConfig: QueryChatConfig = omitBy(
    {
      limit: queryString.limit || 10,
      lastMessageId: queryString.last_message_id,
      lastUpdatedAt: queryString.last_updated_at || new Date()
    },
    isUndefined
  )

  return queryConfig
}
