import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { Input } from '../ui/input'
import IconSearch from '@/assets/icons/icon-search'
import { Button } from '../ui/button'
import { QueryPrdConfig } from '@/hooks/usePrdQueryConfig'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { path } from '@/core/constants/path'
import { SearchChema } from '@/core/zod/productSearch.zod'
import { useTranslation } from 'react-i18next'

export default function Search({ queryString }: { queryString: QueryPrdConfig }) {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof SearchChema>>({
    resolver: zodResolver(SearchChema),
    defaultValues: {
      name: queryString.searchName || ''
    }
  })
  const onSubmit = () => {
    navigate({
      pathname: path.products,
      search: createSearchParams({
        ...queryString,
        searchName: form.getValues('name')
      }).toString()
    })
  }
  const { t } = useTranslation(['product', 'common'])
  return (
    <div className='flex flex-col md:flex-row items-center justify-between pb-6 gap-4 '>
      <h2 className='text-head text-main font-semibold shrink-0'>{t('cleaning_resource')}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=' w-full  md:w-md space-y-4 ' noValidate>
          <FormField
            control={form.control}
            name={'name'}
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    autoComplete='off'
                    placeholder={t('common:search')}
                    type='email'
                    className='w-full h-12 focus:ring-0'
                    {...field}
                    classNameInput='pr-0 p-1.5 '
                    icon={
                      <Button type='submit' className='bg-main w-15 cursor-pointer  hover:bg-main/80 '>
                        <IconSearch className='fill-white' />
                      </Button>
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
