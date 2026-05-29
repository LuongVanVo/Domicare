import { useMutation, useQuery } from '@tanstack/react-query'
import { path } from '../constants/path'
import { chatApi } from '../services/chat.service'
import { ConversationListConfig } from '@/models/interface/chat.interface'
import { QueryChatConfig } from '@/hooks/useChatQueryConfig'

export const useChatQuery = ({ queryString }: { queryString: QueryChatConfig }) => {
  return useQuery({
    queryKey: [path.chat, queryString],
    queryFn: () => chatApi.query(queryString as ConversationListConfig)
  })
}
export const useGetConversationByReceiverId = () => {
  return useMutation({
    mutationFn: chatApi.getByReceiverId,
    mutationKey: ['get conversation']
  })
}
