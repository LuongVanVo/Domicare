import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { LoginSchema } from '@/core/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import LoginGoogle from './LoginGoogle'
import { EMAIL, REMEMBER_ME } from '@/core/configs/const'
import { path } from '@/core/constants/path'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { loginPic, logoSecond } from '@/assets/images'
import { IconMail } from '@/assets/icons/icon-mail'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import isEqual from 'lodash/isEqual'
import { useLoginMutation } from '@/core/queries/auth.query'
import { authApi } from '@/core/services/auth.service'
import { handleErrorAPI } from '@/utils/handleErrorAPI'
import SentEmail from '../Register/SentEmail'
import { useTranslation } from 'react-i18next'
import InputPassword from '@/components/InputPassword/InputPassword'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
export default function Login() {
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [initialEmail, setInitialEmail] = useState<string>('testadmin@gmail.com')
  const { t } = useTranslation('auth')

  // Initialize from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRemember = localStorage.getItem(REMEMBER_ME)
      const remember = isEqual(storedRemember, 'true')
      setRememberMe(remember)

      if (remember) {
        const storedEmail = localStorage.getItem(EMAIL) || 'testadmin@gmail.com'
        setInitialEmail(storedEmail)
      }
    }
  }, [])

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: initialEmail,
      password: 'Testadmin@123'
    }
  })

  // Update form email when initialEmail changes
  useEffect(() => {
    form.setValue('email', initialEmail)
  }, [initialEmail, form])

  const mutationLogin = useLoginMutation({
    mutationFn: authApi.login,
    handleError: (error) => handleErrorAPI(error, form)
  })

  function onSubmit() {
    const loginData = form.getValues() as z.infer<typeof LoginSchema>
    mutationLogin.mutate(loginData)
  }

  const handleChangeRememberMe = (event: boolean) => {
    setRememberMe(event)
    if (typeof window !== 'undefined') {
      localStorage.setItem(REMEMBER_ME, JSON.stringify(event))
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = form.getValues('email')
      if (rememberMe) {
        localStorage.setItem(EMAIL, email)
      }
    }
  }, [rememberMe, form])
  return (
    <div className='grid grid-cols-1 md:grid-cols-12 gap-6 h-screen'>
      <div className='col-span-1 md:col-span-7  h-[40vh] md:h-full'>
        <div className='bg-[#0d5b4d] w-full h-full'>
          <div
            style={{ backgroundImage: `url(${loginPic})` }}
            className={`bg-center w-full h-full bg-contain bg-no-repeat relative`}
          ></div>
        </div>
      </div>
      <div className='col-span-1 md:col-span-5 md:h-full '>
        <div className='flex justify-center flex-col items-center md:h-screen '>
          <Link to={path.home}>
            <img src={logoSecond} alt='logo' className='hidden md:block mb-4' />
          </Link>
          <h1 className='text-2xl md:text-5xl font-semibold text-black mb-6'>{t('login')}</h1>
          <div className='flex  items-center justify-start gap-2 mb-4'>
            <p className='text-sm text-[#112211]  text-left'>{t('login_description')}</p>
            <Link to={path.home} className='text-main text-sub1 font-bold'>
              DomiCare
            </Link>
          </div>
          <Popover>
            <PopoverTrigger>
              <div className='hover:underline cursor-pointer'>{t('common:login_test_account')}</div>
            </PopoverTrigger>
            <PopoverContent>
              <div className=''>
                <p className=''>
                  user: testuser@gmail.com <br /> password: Testuser@123
                </p>
                <p className=''>
                  sale: testsale@gmail.com <br /> password: Testsale@123
                </p>
                <p className=''>
                  admin: testadmin@gmail.com <br /> password: Testadmin@123
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-[90%] md:w-full lg:w-3/4 xl:w-2/3 space-y-2 px-4'
              noValidate
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')} </FormLabel>
                    <FormControl>
                      <Input
                        className='focus:outline-0 mt-1'
                        placeholder={t('email_placeholder')}
                        type='email'
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
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')} </FormLabel>
                    <FormControl>
                      <InputPassword
                        placeholder={t('password_placeholder')}
                        autoComplete='off'
                        className='w-full focus:outline-0 mt-1'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-between items-center'>
                <div className='flex items-center justify-center space-x-2'>
                  <input
                    onChange={(e) => handleChangeRememberMe((e.target as HTMLInputElement).checked)}
                    checked={rememberMe}
                    type='checkbox'
                    id='terms'
                    className='accent-[green] w-4 h-4'
                  />

                  <Label htmlFor='terms' className=' text-sub2 text-base text-gray-500 cursor-pointer'>
                    {t('remember_me')}
                  </Label>
                </div>
                <SentEmail type='reset-password' />
              </div>

              <Button
                loading={mutationLogin.isPending}
                className='w-full text-lg cursor-pointer text-white h-12 bg-main py-3 hover:bg-main/80 duration-300 hover:shadow-lg '
                type='submit'
              >
                {t('login')}
              </Button>
              <p className='flex items-center justify-center'>
                {t('no_account')}?&nbsp;
                <Link to='/register' className='cursor-pointer text-main hover:underline'>
                  {t('register')}
                </Link>
              </p>
            </form>
          </Form>
          <div className='w-[90%] md:w-full lg:w-3/4 xl:w-2/3 space-y-6 px-4 pt-4 mb-10'>
            <div className='flex justify-center'>
              <div className='text-black flex justify-center items-center gap-3 w-1/2'>
                <hr className='h-px w-full' />
                {t('or')}
                <hr className='h-px w-full' />
              </div>
            </div>
            <LoginGoogle />
          </div>
        </div>
      </div>
    </div>
  )
}
