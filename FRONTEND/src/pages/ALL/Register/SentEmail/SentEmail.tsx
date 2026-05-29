import { IconMail } from '@/assets/icons/icon-mail'
import ModalClick from '@/components/ModalClick'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useResetPWMutation, useSentMailMutation } from '@/core/queries/auth.query'
import { SentMailSchema } from '@/core/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type SentEmailType = 'verification' | 'reset-password'

interface SentEmailProps {
  type: SentEmailType
}

export default function SentEmail({ type }: SentEmailProps) {
  const form = useForm<z.infer<typeof SentMailSchema>>({
    resolver: zodResolver(SentMailSchema),
    defaultValues: {
      email: ''
    }
  })
  const { t } = useTranslation(['auth', 'common'])
  const emailConfig = {
    verification: {
      title: t('send_verify_title'),
      description: t('send_verify_description'),
      buttonText: t('send_verify_button'),
      questionText: t('send_verify_question')
    },
    'reset-password': {
      title: t('forgot_password'),
      description: t('reset_password_description'),
      buttonText: t('reset_password'),
      questionText: ''
    }
  }

  const sentEmailMutation = useSentMailMutation(form)
  const resetPWMutation = useResetPWMutation(form)

  const onSubmit = () => {
    if (type === 'verification') {
      sentEmailMutation.mutate()
    } else {
      resetPWMutation.mutate()
    }
  }

  const config = emailConfig[type]
  const isLoading = type === 'verification' ? sentEmailMutation.isPending : resetPWMutation.isPending

  return (
    <div className='flex items-center justify-center flex-wrap '>
      <p className='shrink-0'>{config.questionText}&nbsp;</p>

      <ModalClick
        children={<p className='cursor-pointer text-main hover:underline '>{config.buttonText}</p>}
        render={
          <div className=' bg-white rounded-md h-80 md:h-96 p-4 w-[350px] md:w-2xl flex flex-col items-center justify-center gap-3 '>
            <h2 className='text-head font-semibold'>{config.title}</h2>
            <p className='text-sub2 text-gray text-center'>{config.description}</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className=' w-[90%] md:w-md space-y-4 ' noValidate>
                <FormField
                  control={form.control}
                  name={'email'}
                  render={({ field }) => (
                    <FormItem className=' w-full'>
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

                <Button
                  loading={isLoading}
                  className='w-full text-lg cursor-pointer text-white h-12 bg-main py-3 hover:bg-main/80 duration-300 hover:shadow-lg'
                  type='submit'
                >
                  {t('common:confirm')}
                </Button>
              </form>
            </Form>
          </div>
        }
      />
    </div>
  )
}
