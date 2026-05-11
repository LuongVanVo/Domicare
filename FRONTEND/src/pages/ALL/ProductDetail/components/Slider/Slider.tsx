import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface SlideShowProps {
  images: string[]
}
export default function SlideShow({ images }: SlideShowProps) {
  const [currentIndexImg, setCurrentIndexImg] = useState([0, 5])

  const [activeImg, setActiveImg] = useState<string | null>(null)

  const currentImgs = useMemo(() => (images ? images.slice(...currentIndexImg) : []), [images, currentIndexImg])
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (images && images.length > 0) setActiveImg(images && images[0])
  }, [images])

  const chooseActiveImg = (img: string) => {
    setActiveImg(img)
  }
  const nextSlider = () => {
    if (currentIndexImg[1] < images.length) {
      setCurrentIndexImg((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }
  const prevSlider = () => {
    if (currentIndexImg[0] > 0) {
      setCurrentIndexImg((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  // hieu ung zoom khi hover
  const handleZoomImg = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const image = ref.current as HTMLImageElement
    const { naturalHeight, naturalWidth } = image
    const offsetX = event.pageX - (rect.x + window.scrollX)
    const offsetY = event.pageY - (rect.y + window.scrollY)

    const top = offsetY * (1 - naturalHeight / rect.height)
    const left = offsetX * (1 - naturalWidth / rect.width)
    image.style.width = naturalWidth + 'px'
    image.style.height = naturalHeight + 'px'
    image.style.maxWidth = 'unset'
    image.style.top = top + 'px'
    image.style.left = left + 'px'
  }
  const handleRemoveZoom = () => {
    ref.current?.removeAttribute('style')
  }
  return (
    <div className='flex justify-center items-center flex-col'>
      <div
        onMouseMove={handleZoomImg}
        onMouseLeave={handleRemoveZoom}
        className='relative w-full shadow cursor-zoom-in overflow-hidden pt-[100%]'
      >
        <img
          ref={ref}
          src={activeImg ? activeImg : 'unknow'}
          alt={'anh dich vu'}
          className=' absolute top-0 left-0 h-full w-full bg-white object-cover'
        />
      </div>
      <div className='flex gap-3 w-full relative mt-4'>
        <button
          onClick={(e) => {
            e.preventDefault()
            prevSlider()
          }}
          className='bg-slate-500/30 hover:bg-slate-500/50 cursor-pointer absolute top-[50%] px-1 py-3 left-0 translate-y-[-50%] z-10 flex items-center justify-center'
        >
          <ChevronLeft className='!w-6 !h-auto  text-white' />
        </button>
        {currentImgs &&
          currentImgs.slice(0, 5).map((img, index) => {
            const isActive = isEqual(img, activeImg)
            return (
              <div
                key={index}
                onMouseEnter={() => chooseActiveImg(img)}
                className={classNames(
                  'w-full cursor-pointer',
                  {
                    'border-2 border-main ': isActive
                  },
                  {
                    'border-2 border-gray/10 ': !isActive
                  }
                )}
              >
                <div className='w-full relative pt-[100%]'>
                  <img className='absolute top-0 left-0 w-full h-full' src={img} alt={'Anh dich vu'} />
                </div>
              </div>
            )
          })}
        <button
          onClick={(e) => {
            e.preventDefault()
            nextSlider()
          }}
          className='bg-slate-500/30 hover:bg-slate-500/50 cursor-pointer absolute top-[50%] px-1 py-3 right-0 translate-y-[-50%] z-10 flex items-center justify-center'
        >
          <ChevronRight className='!w-6 !h-auto  text-white' />
        </button>
      </div>
    </div>
  )
}
