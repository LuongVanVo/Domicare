import { useForm } from 'react-hook-form'
import SectionUser from '../../Layouts/SectionUser'
import { z } from 'zod'
import { UpdatePassUserSchema } from '@/core/zod/updateUser.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { UserUpdate } from '@/models/interface/user.interface'
import { Button } from '@/components/ui/button'
import InputPassword from '@/components/InputPassword/InputPassword'
import { initialChangePW } from '@/core/constants/initialValue.const'
import { isAxiosError } from 'axios'
import { useUpdateUserMutation } from '@/core/queries/user.query'
import { useTranslation } from 'react-i18next'

export default function ChangePassword() {
  const { t } = useTranslation(['auth', 'common'])
  const form = useForm<z.infer<typeof UpdatePassUserSchema>>({
    resolver: zodResolver(UpdatePassUserSchema),
    defaultValues: {
      oldPassword: initialChangePW.oldPassword,
      confirmPassword: initialChangePW.newPassword,
      newPassword: initialChangePW.confirmPassword
    }
  })
  const userUpdateMutation = useUpdateUserMutation({})

  const handleSubmitForm = async (data: Pick<UserUpdate, 'oldPassword' | 'newPassword'>) => {
    try {
      await userUpdateMutation.mutateAsync(data)
      form.setValue('oldPassword', initialChangePW.oldPassword)
      form.setValue('newPassword', initialChangePW.newPassword)
      form.setValue('confirmPassword', initialChangePW.confirmPassword)
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message
        form.setError('oldPassword', {
          type: 'server',
          message: message
        })
      }
    }
  }
  return (
    <SectionUser title={t('change_password')} description={t('change_password_description')}>
      <div className='flex justify-center w-full'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className='w-full md:w-full space-y-2  mb-10' noValidate>
            <div className='grid grid-cols-12 gap-4 my-4'>
              <div className='col-span-12 md:col-span-7 order-2 md:order-1'>
                <FormField
                  control={form.control}
                  name='oldPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('old_password')}</FormLabel>
                      <FormControl>
                        <InputPassword placeholder={t('old_password_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new_password')}</FormLabel>

                      <FormControl>
                        <InputPassword placeholder={t('new_password_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='mb-4'>
                      <FormLabel>{t('confirm_password')}</FormLabel>
                      <FormControl>
                        <InputPassword placeholder={t('confirm_password_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-center items-center'>
                  <Button
                    loading={userUpdateMutation.isPending}
                    className='w-full  mt-10 text-lg cursor-pointer text-white h-12 bg-main py-3 hover:bg-main/80 duration-300 hover:shadow-lg '
                    type='submit'
                  >
                    {t('change_password')}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </SectionUser>
  )
}
