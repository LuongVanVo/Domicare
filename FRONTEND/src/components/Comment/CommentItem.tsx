import { cn } from '@/core/lib/utils'
import RatingStars from '../RatingStars/RatingStars'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { initialComment } from '@/core/constants/initialValue.const'
import isEqual from 'lodash/isEqual'
import { GENDER_TYPE } from '@/models/types/user.type'

interface CommentItemProps {
  comment?: string
  gender?: GENDER_TYPE
  avatar?: string
  address?: string
  name?: string
  rating?: number
  className?: string
}

export default function CommentItem(props: CommentItemProps) {
  const {
    comment = initialComment.comment,
    address = initialComment.address,
    avatar = initialComment.avatar,
    gender = initialComment.gender,
    name = initialComment.name,
    rating = initialComment.rating,
    className
  } = props
  const genderName = isEqual(gender, 'MALE') ? 'Anh ' : 'Chị '
  return (
    <div
      className={cn(
        'bg-white p-6 rounded-lg  border border-gray-200 shadow-md min-h-72 md:min-h-64 flex justify-center flex-col',
        className
      )}
    >
      <blockquote className='text-gray text-base mb-4 text-justify italic'>{comment && `"${comment}"`}</blockquote>
      <div className='flex items-center space-x-4'>
        <Avatar className='!size-15'>
          <AvatarImage src={avatar} className='w-full h-full object-cover' alt='@shadcn' />
          <AvatarFallback>{name?.substring(0, 2) || 'CC'}</AvatarFallback>
        </Avatar>
        <div>
          <RatingStars rating={rating} />
          <h3 className='text-lg font-semibold text-black line-clamp-1'>{name ? genderName + name : 'User'} </h3>
          <p className='text-sm text-gray'>{address}</p>
        </div>
      </div>
    </div>
  )
}
