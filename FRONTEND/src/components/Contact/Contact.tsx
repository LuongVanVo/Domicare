import { animateScroll } from 'react-scroll'
import IconChevronUp from '@/assets/icons/icon-chevron-up'
import { PhoneCallIcon } from 'lucide-react'
import { ICON_SIZE_EXTRA } from '@/core/configs/icon-size'
import { useEffect, useState } from 'react'
// import Chat from '../Chat'  // Disabled: Backend không có Socket.IO server cho chat
export default function Contact() {
  const handleScrollUp = () => animateScroll.scrollTo(0, { smooth: true, duration: 500 })
  const [showUpBtn, setShowUpBtn] = useState<boolean>(false)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowUpBtn(true)
      } else {
        setShowUpBtn(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return (
    <div className='fixed bottom-20 right-2 md:bottom-30 overflow-hidden z-50'>
      {showUpBtn && (
        <button
          onClick={handleScrollUp}
          className='flex rounded-full shadow-sm m-2 items-center justify-center size-16 cursor-pointer  bg-emerald-400'
        >
          <IconChevronUp className='fill-white w-10 h-10 text-center ml-1' />
        </button>
      )}
      {/* <Chat /> */}
      <a href='tel:0987654321'>
        <div className='flex rounded-full mt-6 shadow-sm m-2 items-center justify-center size-16 cursor-pointer animate-bounce text-white bg-emerald-400'>
          <PhoneCallIcon width={ICON_SIZE_EXTRA} height={ICON_SIZE_EXTRA} />
        </div>
      </a>
    </div>
  )
}
