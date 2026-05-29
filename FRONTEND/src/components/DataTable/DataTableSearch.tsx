import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createSearchParams } from 'react-router-dom'
import omit from 'lodash/omit'
import { useState } from 'react'
import { Button } from '../ui/button'

interface DataTableSearchProps {
  searchKey: string
  placeholder?: string
  currentParams?: Record<string, string>
  pathname: string
}

export function DataTableSearch({
  searchKey,
  placeholder = 'Tìm kiếm',
  currentParams = {},
  pathname
}: DataTableSearchProps) {
  const [values, setValue] = useState<string>(currentParams[searchKey] || '')
  const navigate = useNavigate()

  const onSearch = () => {
    navigate({
      pathname,
      search: createSearchParams({
        ...currentParams,
        [searchKey]: values
      }).toString()
    })
  }

  const handleRemoveSearch = () => {
    navigate({
      pathname,
      search: createSearchParams(omit(currentParams, [searchKey])).toString()
    })
  }

  return (
    <div className='flex items-center gap-2 pr-2'>
      <Input
        placeholder={placeholder}
        type='text'
        value={values}
        onChange={(event) => setValue(event.target.value)}
        className='w-full md:w-auto block'
        classNameInput={'w-full md:w-auto'}
        icon={<Search />}
        iconOnClick={onSearch}
      />
      {values && (
        <Button variant={'destructive'} onClick={handleRemoveSearch}>
          Xóa
        </Button>
      )}
    </div>
  )
}
