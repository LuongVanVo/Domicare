import classNames from 'classnames'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Conversation } from '@/models/interface/chat.interface'
import { mascot } from '@/assets/images'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export default function MessageChat({
  messages,
  userId,
  fetchMoreConversation,
  hasMore,
  onDeleteMessage
}: {
  messages: Conversation[]
  userId?: string
  fetchMoreConversation: () => void
  hasMore: boolean
  onDeleteMessage?: (messageId: string) => void
}) {
  const [showDots, setShowDots] = useState(false)
  const [showText, setShowText] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  const fullText = 'Xin chào, mình là trợ lý ảo Domicare. Mình có thể giúp gì cho bạn?'

  useEffect(() => {
    if (messages.length > 0) {
      setShowText(true)
      setDisplayedText(fullText)
      return
    }
    const timer1 = setTimeout(() => setShowDots(true), 1000)
    const timer2 = setTimeout(() => setShowText(true), 2000)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [messages.length])

  useEffect(() => {
    if (messages.length === 0) {
      if (showText) {
        let i = 0
        const interval = setInterval(() => {
          setDisplayedText(fullText.slice(0, i + 1))
          i++
          if (i >= fullText.length) clearInterval(interval)
        }, 30)
        return () => clearInterval(interval)
      }
    }
  }, [showText, messages.length])

  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return ''
    }
  }

  return (
    <div
      id='scrollableDiv'
      className='h-full w-full'
      style={{
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
    >
      <InfiniteScroll
        dataLength={messages.length}
        next={fetchMoreConversation}
        hasMore={hasMore}
        inverse={true}
        scrollableTarget='scrollableDiv'
        loader={<div className='w-full text-center py-2 text-sm text-gray-500'>Đang tải thêm...</div>}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '10px'
        }}
      >
        {/* 🟢 Ảnh mascot xuất hiện có hiệu ứng fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className=''
        >
          <img src={mascot} alt='mascot' className='w-1/2 h-auto' />
        </motion.div>

        {/* 🟢 Hiệu ứng "đang soạn" rồi tới typing */}
        <div>
          {!showText && showDots && (
            <motion.p
              className={classNames('max-w-[70%] inline px-3 py-2 my-1 text-white rounded-lg break-words bg-gray-600')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 0.6
              }}
            >
              ...
            </motion.p>
          )}

          {showText && (
            <motion.p
              className={classNames('max-w-[70%]  px-3 py-2 my-1 text-white rounded-lg break-words bg-gray-600')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {displayedText}
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                |
              </motion.span>
            </motion.p>
          )}
        </div>

        {/* 🟢 Các tin nhắn khác */}
        {messages.map((item) => {
          const isOwnMessage = userId === item.sender_id
          const formattedTime = formatTime(item.created_at)

          return (
            <div
              className={classNames('flex w-full group my-1.5 items-end gap-2', {
                'justify-end': isOwnMessage,
                'justify-start': !isOwnMessage
              })}
              key={item._id}
            >
              {isOwnMessage && onDeleteMessage && item._id && (
                <button
                  onClick={() => onDeleteMessage(item._id!)}
                  className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg'
                  title='Xóa tin nhắn'
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div
                className={classNames('max-w-[70%] px-3.5 py-2.5 rounded-2xl break-words relative shadow-sm', {
                  'bg-emerald-500 text-white rounded-br-none': isOwnMessage,
                  'bg-white text-slate-800 border border-slate-100 rounded-bl-none': !isOwnMessage
                })}
              >
                <p className='text-sm leading-relaxed'>{item.message}</p>
                {formattedTime && (
                  <span
                    className={classNames('text-[9px] block text-right mt-1 font-medium select-none', {
                      'text-emerald-100/90': isOwnMessage,
                      'text-slate-400': !isOwnMessage
                    })}
                  >
                    {formattedTime}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </InfiniteScroll>
    </div>
  )
}
