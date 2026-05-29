import { IconMail } from '@/assets/icons/icon-mail'
import { pic6, logoSecond } from '@/assets/images'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { path } from '@/core/constants/path'
import { RegisterSchema } from '@/core/zod'
import { handleErrorAPI } from '@/utils/handleErrorAPI'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import SentEmail from './SentEmail'
import { useRegisterMutation } from '@/core/queries/auth.query'
import InputPassword from '@/components/InputPassword/InputPassword'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Register() {
  const navigate = useNavigate()
  const { t } = useTranslation(['auth', 'common'])
  const [isConfirm, setIsconfirm] = useState<boolean>(false)
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })
  const mutationRegister = useRegisterMutation({ handleError: (error) => handleErrorAPI(error, form) })
  const handleRegister = async () => {
    await mutationRegister.mutateAsync(form.getValues())
    navigate(path.login)
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-12 gap-6 h-screen'>
      <div className='order-2 md:order-1 col-span-1 md:col-span-5 md:h-full '>
        <div className='flex justify-center flex-col items-center md:h-screen'>
          <Link to={path.home}>
            <img src={logoSecond} alt='logo' className='hidden md:block mb-4' />
          </Link>
          <h1 className='text-2xl md:text-5xl font-semibold text-black mb-6'>{t('register')}</h1>
          <div className='flex  items-center justify-start gap-2 mb-4 px-4'>
            <p className='text-sm text-[#112211]  text-center'>
              {t('register_description')}
              <Link to={path.home} className='text-main text-sub1 font-bold'>
                DomiCare
              </Link>
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRegister)}
              className='w-[90%] md:w-full lg:w-3/4 xl:w-2/3 space-y-2 px-4 mb-10'
              noValidate
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete='off'
                        placeholder={t('email_placeholder')}
                        type='email'
                        className='w-full focus:outline-0 mt-1'
                        {...field}
                        icon={<IconMail />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={'password'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <InputPassword
                        autoComplete='off'
                        placeholder={t('password_placeholder')}
                        className='w-full focus:outline-0 mt-1'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />

                    <div className='flex flex-col text-sub2 text-gray'>
                      <h4 className=''>{t('password_description')}</h4>
                      <ul className='flex flex-col '>
                        <li>- {t('password_description_1')}</li>
                        <li>- {t('password_description_2')}</li>
                      </ul>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirm_password')}</FormLabel>
                    <FormControl>
                      <InputPassword
                        placeholder={t('confirm_password_placeholder')}
                        autoComplete='off'
                        className='w-full focus:outline-0 mt-1'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-between'>
                <div className='flex items-center justify-center space-x-2'>
                  <Checkbox
                    onClick={() => setIsconfirm((prev) => !prev)}
                    checked={isConfirm}
                    id='terms'
                    className='cursor-pointer w-4 h-4'
                  />
                  <Label htmlFor='terms' className='text-base font-normal text-gray-500 cursor-default'>
                    {t('common:agree')}{' '}
                    <span className='text-main hover:underline cursor-pointer'>{t('common:terms')}</span>{' '}
                    {t('common:and')}{' '}
                    <span className='text-main hover:underline cursor-pointer '>{t('common:privacy_policy')}</span>
                  </Label>
                </div>
              </div>
              <Button
                loading={mutationRegister.isPending}
                className='w-full text-lg cursor-pointer text-white h-12 bg-main py-3 hover:bg-main/80 duration-300 hover:shadow-lg '
                type='submit'
                disabled={!isConfirm}
              >
                {t('create_account_button')}
              </Button>
              <SentEmail type='verification' />
              <p className='flex items-center justify-center '>
                {t('have_account')}?&nbsp;
                <Link to='/login' className='cursor-pointer  text-main hover:underline '>
                  {t('login')}
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
      <div className='order-1 col-span-1 md:col-span-7  h-[40vh] md:h-full'>
        <div className='bg-[#d4e9e0] w-full h-full'>
          <div
            style={{ backgroundImage: `url(${pic6})` }}
            className={`bg-center w-full h-full bg-contain bg-no-repeat relative`}
          ></div>
        </div>
      </div>
    </div>
  )
}
