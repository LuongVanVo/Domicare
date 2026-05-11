import axiosClient from './axios-client'
import { SuccessResponse } from '@/models/interface/response.interface'
import { ConversationListConfig, ConversationResponse } from '@/models/interface/chat.interface'

const API_CHAT_URL = '/conversations/receivers'
export const chatApi = {
  query: (params: ConversationListConfig) => {
    return axiosClient.get<SuccessResponse<ConversationResponse>>(API_CHAT_URL, { params })
  },
  getByReceiverId: ({ params, receiverId }: { params: ConversationListConfig; receiverId: string }) => {
    return axiosClient.get<SuccessResponse<ConversationResponse>>(`${API_CHAT_URL}/${receiverId}`, { params })
  }
}
