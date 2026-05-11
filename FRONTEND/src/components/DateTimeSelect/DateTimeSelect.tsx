import classNames from 'classnames'
import range from 'lodash/range'
import React, { Fragment, useEffect, useState } from 'react'

interface DateSelectProps {
  onChange?: (value: Date) => void
  value?: Date
  errorMessage?: string
}
interface DateTime {
  day: number
  month: number
  year: number
}
export default function DateTimeSelect({ onChange, value, errorMessage }: DateSelectProps) {
  const [date, setDate] = useState<DateTime>({
    day: 1,
    month: 0,
    year: 2000
  })

  // Helper function để check valid date
  const isValidDate = (d: Date | undefined): d is Date => {
    return d instanceof Date && !isNaN(d.getTime())
  }

  useEffect(() => {
    if (isValidDate(value)) {
      setDate({ 
        day: value.getDate(), 
        month: value.getMonth(), 
        year: value.getFullYear() 
      })
    }
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = event.target
    const numValue = Number(value)
    
    // Kiểm tra nếu conversion thất bại
    if (isNaN(numValue)) {
      console.error('Invalid number value:', value)
      return
    }
    
    const newDate = {
      ...date,
      [name]: numValue
    }
    
    setDate(newDate)
    onChange?.(new Date(newDate.year, newDate.month, newDate.day))
  }
  
  return (
    <Fragment>
      <div className='flex flex-nowrap mt-1 mb-0'>
        <div className='flex w-full justify-between items-center flex-wrap'>
          <select
            onChange={handleChange}
            name='day'
            value={isValidDate(value) ? value.getDate() : date.day}
            className={classNames(
              'w-[33%] border text-sm focus:outline-none rounded-md text-black h-10 mo:p-2 border-[#e2e2e2]  hover:border-main cursor-pointer',
              { 'border-red-500 text-red-500': errorMessage }
            )}
          >
            <option disabled>Ngày</option>
            {range(1, 32).map((item, index) => (
              <option className='text-center' value={item} key={index}>
                {item}
              </option>
            ))}
          </select>
          
          <select
            name='month'
            onChange={handleChange}
            value={isValidDate(value) ? value.getMonth() : date.month}
            className={classNames(
              'w-[30%] border text-sm focus:outline-none rounded-md text-black h-10 mo:p-2 border-[#e2e2e2]  hover:border-main cursor-pointer',
              { 'border-red-500 text-red-500': errorMessage }
            )}
          >
            <option disabled>Tháng</option>
            {range(0, 12).map((item, index) => (
              <option value={item} key={index} className='text-center'>
                Tháng {item + 1}
              </option>
            ))}
          </select>
          
          <select
            name='year'
            onChange={handleChange}
            value={isValidDate(value) ? value.getFullYear() : date.year}
            className={classNames(
              'w-[30%] border text-sm focus:outline-none rounded-md text-black h-10 mo:p-2 border-[#e2e2e2]  hover:border-main cursor-pointer',
              { 'border-red-500 text-red-500': errorMessage }
            )}
          >
            <option disabled>Năm</option>
            {range(1910, 2030).map((item, index) => (
              <option value={item} key={index} className='text-center'>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className=' w-full text-red-500 text-sm'>{errorMessage}</div>
    </Fragment>
  )
}