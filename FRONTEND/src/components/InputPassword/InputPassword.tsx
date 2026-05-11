import { InputHTMLAttributes, useState } from 'react'
import { Input } from '../ui/input'
import { IconEye, IconNonEye } from '@/assets/icons'

export default function InputPassword({ placeholder, ...field }: InputHTMLAttributes<HTMLInputElement>) {
  const [isShow, setIsShow] = useState<boolean>(false)
  return (
    <Input
      placeholder={placeholder}
      autoComplete='off'
      type={isShow ? 'text' : 'password'}
      className='w-full focus:outline-0 mt-1'
      {...field}
      iconOnClick={() => setIsShow((prev) => !prev)}
      icon={isShow ? <IconEye /> : <IconNonEye />}
    />
  )
}
