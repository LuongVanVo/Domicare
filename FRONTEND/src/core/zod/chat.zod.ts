import { z } from 'zod'

export const ChatSchema = z.object({
  message: z.string().min(0, {
    message: 'Tin nhắn không được để trống.'
  })
})
