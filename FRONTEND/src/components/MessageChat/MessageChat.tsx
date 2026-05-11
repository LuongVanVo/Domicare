import classNames from 'classnames'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Conversation } from '@/models/interface/chat.interface'
import { mascot } from '@/assets/images'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function MessageChat({
  messages,
  userId,
  fetchMoreConversation,
  hasMore
}: {
  messages: Conversation[]
  userId?: string
  fetchMoreConversation: () => void
  hasMore: boolean
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

  return (
    <div
      id='scrollableDiv'
      style={{
        height: '80vh',
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
        {messages.map((item) => (
          <div
            className={classNames('flex w-full', {
              'justify-end': userId === item.sender_id,
              'justify-start': userId !== item.sender_id
            })}
            key={item._id}
          >
            <p
              className={classNames('max-w-[70%] px-3 py-2 my-1 text-white rounded-lg break-words', {
                'bg-blue-500': userId === item.sender_id,
                'bg-gray-600': userId !== item.sender_id
              })}
            >
              {item.message}
            </p>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
