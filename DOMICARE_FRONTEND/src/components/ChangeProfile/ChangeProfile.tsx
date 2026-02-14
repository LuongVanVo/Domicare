import InputFile from '@/components/InputFile'
import { path } from '@/core/constants/path'
import { AppContext } from '@/core/contexts/app.context'
import { userApi } from '@/core/services/user.service'
import { UserUpdate, UserUpdateRequest } from '@/models/interface/user.interface'
import { Toast } from '@/utils/toastMessage'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IconMail } from '@/assets/icons/icon-mail'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Loader2, MapPinned, Phone, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UpdateUserSchema } from '@/core/zod/updateUser.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { gender } from '@/core/constants/user.const'
import { Label } from '@/components/ui/label'
import hideEmail from '@/utils/hideEmail'
import DateTimeSelect from '@/components/DateTimeSelect'
import { useUploadFileMutation } from '@/core/queries/file.query'
import { useUpdateUserMutation } from '@/core/queries/user.query'
import { useTranslation } from 'react-i18next'

export default function Profile() {
  const { profile } = useContext(AppContext)
  const { t } = useTranslation(['auth', 'common'])
  const userId = profile?.id || 1
  const [file, setFile] = useState<File>()
  const fileLocal = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  // call API
  const userUpdateMutation = useUpdateUserMutation({})
  const updateAvatarMutation = useUploadFileMutation()
  // form
  const form = useForm<z.infer<typeof UpdateUserSchema>>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      address: '',
      name: '',
      gender: undefined,
      phone: '',
      imageId: undefined,
      dateOfBirth: undefined
    }
  })
  const { data, isLoading, refetch } = useQuery({
    queryKey: [path.user.profile],
    queryFn: () => userApi.getById(userId),
    staleTime: 60 * 1000 * 3
  })
  const user = data?.data.data

  useEffect(() => {
    if (user) {
      form.setValue('gender', user.gender || gender.other)
      form.setValue('address', user.address || '')
      form.setValue('phone', user.phone || '')
      form.setValue('name', user.name || '')
      const dateOfBirth = new Date(user.dateOfBirth as string)
      form.setValue('dateOfBirth', dateOfBirth)
    }
  }, [user, form])

  const handleSubmitForm = async (data: UserUpdate) => {
    try {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const avatarRes = await updateAvatarMutation.mutateAsync({ formData })
        data.imageId = avatarRes.data.data.id
        setFile(undefined)
      }
      
      const dataApi = {
        ...data,
        dateOfBirth: data.dateOfBirth 
          ? formatDateToYYYYMMDD(data.dateOfBirth)
          : undefined
      }
      
      await userUpdateMutation.mutateAsync(dataApi as UserUpdateRequest)
      refetch()
    } catch {
      Toast.error({ description: 'Lỗi không xác định.' })
    }
  }
  
  // Helper function
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <Fragment>
      {isLoading ? (
        <div className='min-h-[400px] flex justify-center items-center'>
          <Loader2 className='!w-15 h-auto text-mainStrong animate-spin' />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className='w-full md:w-full space-y-2  mb-10' noValidate>
            <div className='grid grid-cols-12 gap-4 my-4'>
              <div className='col-span-12 md:col-span-7 order-2 md:order-1'>
                <div>
                  <Label>{t('email')}</Label>
                  <Input
                    disabled
                    value={hideEmail(user?.email) || hideEmail(profile?.email)}
                    type='email'
                    className='w-full bg-gray-50 cursor-not-allowed mt-1'
                    icon={<IconMail />}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('full_name')}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder={t('full_name_placeholder')}
                          type='text'
                          className='w-full focus:outline-0 mt-1'
                          {...field}
                          icon={<User />}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-4 mt-3'>
                      <FormLabel>{t('gender')}:</FormLabel>

                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex'>
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value={gender.male} />
                            </FormControl>
                            <FormLabel className='font-normal'>{t('male')}</FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value={gender.female} />
                            </FormControl>
                            <FormLabel className='font-normal'>{t('female')}</FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-3 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value={gender.other} />
                            </FormControl>
                            <FormLabel className='font-normal'>{t('other')}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone')}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder={t('phone_placeholder')}
                          type='text'
                          className='w-full focus:outline-0 mt-1'
                          {...field}
                          icon={<Phone />}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dateOfBirth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('birthday')}</FormLabel>
                      <FormControl>
                        <DateTimeSelect
                          onChange={field.onChange}
                          value={field.value}
                          errorMessage={form.formState.errors.dateOfBirth?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('address_placeholder')}
                          autoComplete='off'
                          className='w-full focus:outline-0 mt-1'
                          {...field}
                          icon={<MapPinned />}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Button
                    loading={userUpdateMutation.isPending || updateAvatarMutation.isPending}
                    className='w-full  mt-10 text-lg cursor-pointer text-white h-12 bg-main py-3 hover:bg-main/80 duration-300 hover:shadow-lg '
                    type='submit'
                  >
                    {t('save')}
                  </Button>
                </div>
              </div>
              <div className='col-span-12 md:col-span-5 order-1 w-full h-full'>
                <div className='h-full flex flex-col items-center justify-center gap-6 mo:pt-10 '>
                  <div className='overflow-hidden shadow-md rounded-full w-35 h-35'>
                    <img
                      className='w-full h-full object-cover '
                      src={fileLocal || user?.avatar || profile?.avatar}
                      alt='avatar'
                    />
                  </div>
                  <InputFile setFile={setFile} />
                  <div className='text-gray-400 text-sm text-left pl-1 pb-4 md:pb-0'>
                    <p>{t('common:format_image')}</p>
                    <p>{t('common:format_image_description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </Fragment>
  )
}
