import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import config from '@/configs'
import { ICON_SIZE_EXTRA } from '@/configs/icon-size'
import { AppContext } from '@/core/contexts/app.context'
import { ChatSchema } from '@/core/zod/chat.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquare, Send } from 'lucide-react'
import { useContext, useEffect, useRef, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { useGetConversationByReceiverId } from '@/core/queries/chat.query'
import { Conversation, Cursor } from '@/models/interface/chat.interface'
import MessageChat from '../MessageChat'
import { useWebSocket } from '@/hooks/useWebSocket'

export function Chat() {
  const [messages, setMessages] = useState<Conversation[]>([])
  const cursorRef = useRef<Cursor>({ last_message_id: '', last_updated_at: '' })
  const chatMutation = useGetConversationByReceiverId()
  const { profile } = useContext(AppContext)
  const user = profile?._id

  const webSocketConfig = useMemo(
    () => ({
      url: `${config.baseUrl}/ws`,
      topics: {
        chat_message: (data: Conversation) => {
          setMessages((prev) => [...prev, data])
        }
      }
    }),
    []
  )

  const { sendMessage } = useWebSocket(webSocketConfig)

  useEffect(() => {
    if (user) {
      chatMutation
        .mutateAsync({ receiverId: user, params: { limit: 10 } })
        .then((conversations) => {
          const historyChats = conversations.data.data.data
          cursorRef.current = conversations.data.data.cursor
          setMessages(historyChats)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [user])

  const handleSendMessage = () => {
    const message = form.getValues('message')
    if (!message.trim()) return

    sendMessage('send_chat', {
      receiver_id: user as string,
      message: message
    })
    form.setValue('message', '')
  }

  const form = useForm<z.infer<typeof ChatSchema>>({
    resolver: zodResolver(ChatSchema),
    defaultValues: {
      message: ''
    }
  })

  const fetchMoreConversation = () => {
    if (user) {
      chatMutation
        .mutateAsync({
          receiverId: user,
          params: {
            limit: 10,
            last_updated_at: cursorRef.current.last_updated_at,
            last_message_id: cursorRef.current.last_message_id
          }
        })
        .then((conversations) => {
          const historyChats = conversations.data.data.data
          cursorRef.current = conversations.data.data.cursor
          console.warn(cursorRef.current, 'current cursor')

          setMessages((prev) => [...historyChats, ...prev])
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className='flex rounded-full mt-6 shadow-sm m-2 items-center justify-center size-16 cursor-pointer text-white bg-emerald-400'>
          <MessageSquare width={ICON_SIZE_EXTRA} height={ICON_SIZE_EXTRA} />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>

        <div className='max-h-9/12'>
          <MessageChat
            hasMore={Boolean(cursorRef.current)}
            messages={messages}
            userId={profile?._id}
            fetchMoreConversation={fetchMoreConversation}
          />
        </div>
        <SheetFooter>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSendMessage)}
              className='flex gap-2 justify-center items-center'
              noValidate
            >
              <FormField
                control={form.control}
                name='message'
                render={({ field }) => (
                  <FormItem className='flex-grow'>
                    <FormControl>
                      <Input className='focus:outline-0 mt-1' placeholder='Nhập tin nhắn' type='text' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type='submit'>
                <Send size={ICON_SIZE_EXTRA} />
              </Button>
            </form>
          </Form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
