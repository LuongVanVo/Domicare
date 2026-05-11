import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import config from '@/configs'
import { ICON_SIZE_EXTRA } from '@/configs/icon-size'
import { AppContext } from '@/core/contexts/app.context'
import { ChatSchema } from '@/core/zod/chat.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquare, Send } from 'lucide-react'
import { useContext, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { useGetConversationByReceiverId } from '@/core/queries/chat.query'
import { Conversation, Cursor } from '@/models/interface/chat.interface'
import MessageChat from '../MessageChat'
import { getAccessTokenFromLS } from '@/utils/storage'

export function Chat() {
  const [messages, setMessages] = useState<Conversation[]>([])
  const cursorRef = useRef<Cursor>({ last_message_id: '', last_updated_at: '' })
  const chatMutation = useGetConversationByReceiverId()
  const socketRef = useRef<any>(null)
  const { profile } = useContext(AppContext)
  const user = profile?._id

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return
    }

    if (!socketRef.current) {
      // Dynamic import socket.io-client
      import('socket.io-client')
        .then(({ io }) => {
          const token = getAccessTokenFromLS()
          const socket = io(config.baseUrl, {
            auth: {
              authorization: `Bearer ${token}`
            }
          })

          socketRef.current = socket
          socket.on('connect_error', (err) => {
            console.log('Socket connection error:', err)
          })

          socket.on('receive chat', (data: Conversation) => {
            setMessages((prev) => [...prev, data])
          })
        })
        .catch((err) => {
          console.error('Failed to load socket.io-client:', err)
        })
    }

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

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
    const date = new Date()
    const conversationNext: Conversation = {
      receiver_id: user as string,
      message: message,
      sender_id: profile?._id as string,
      created_at: date,
      updated_at: date
    }
    setMessages((prev) => [...prev, conversationNext])
    socketRef.current?.emit('private chat', conversationNext)
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
