import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { getBookingStatusList } from '@/configs/consts'
import { path } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import { useBookingQueryConfig } from '@/hooks/useBookingQueryConfig'
import { BookingStatus } from '@/models/interface/booking.interface'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'

import { CheckIcon, PlusCircle, XCircle } from 'lucide-react'

import { createSearchParams, useNavigate } from 'react-router-dom'

export function BookingButtonAction() {
  const queryString = useBookingQueryConfig({})
  const { bookingStatus } = queryString
  const bookingStatusList = getBookingStatusList()
  const navigate = useNavigate()

  const handleRemoveSearch = () =>
    navigate({
      pathname: path.admin.booking,
      search: createSearchParams(
        omit(
          {
            ...queryString
          },
          ['bookingStatus']
        )
      ).toString()
    })
  const handleSearchStatus = (status: BookingStatus) => {
    navigate({
      pathname: path.admin.booking,
      search: createSearchParams({
        ...queryString,
        bookingStatus: status
      }).toString()
    })
  }
  return (
    <div className='flex items-cente gap-2 flex-col md:flex-row'>
      <div className='flex w-full justify-between'>
        <div className='flex items-center gap-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='sm' className='h-10 border-dashed'>
                <PlusCircle className='!h-6 !w-6' />
                <p className='text-sm'> Trạng thái</p>

                {bookingStatus && (
                  <>
                    <Separator orientation='vertical' className='mx-2 h-4' />
                    <div className='hidden space-x-1 lg:flex'>
                      <Badge variant='secondary' key={'1'} className='rounded-sm  px-1 font-normal'>
                        {bookingStatusList.find((e) => isEqual(e.value, bookingStatus))?.label}
                      </Badge>
                    </div>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0' align='start'>
              <Command>
                <CommandInput placeholder={'Trạng thái'} className='text-gray' />
                <CommandList>
                  <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
                  <CommandGroup>
                    {bookingStatusList.map((option) => {
                      const isSelected = isEqual(option.value, bookingStatus)
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            if (isSelected) {
                              handleRemoveSearch()
                            } else {
                              handleSearchStatus(option.value as BookingStatus)
                            }
                          }}
                        >
                          <div
                            className={cn(
                              'border-primary flex h-4 w-4 items-center justify-center rounded-sm border',
                              isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                            )}
                          >
                            <CheckIcon className={cn('h-4 w-4')} />
                          </div>
                          <span>{option.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  {bookingStatus && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem onSelect={() => handleRemoveSearch()} className='justify-center text-center'>
                          Xóa bộ lọc
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {bookingStatus && (
            <Button variant='ghost' onClick={handleRemoveSearch} className='h-8 px-2 lg:px-3'>
              Xóa bộ lọc
              <XCircle className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
