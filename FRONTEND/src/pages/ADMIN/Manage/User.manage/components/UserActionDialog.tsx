import { Fragment, useMemo, useState } from 'react'
import { User, UserRequest, UserUpdateRequest } from '@/models/interface/user.interface'
import { GENDER_TYPE } from '@/models/types/user.type'
import InputFile from '@/components/InputFile'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { gender } from '@/core/constants/user.const'
import { IconMail } from '@/assets/icons/icon-mail'
import hideEmail from '@/utils/hideEmail'
import { Label } from '@/components/ui/label'
import DateTimeSelect from '@/components/DateTimeSelect'
import { DEFAULT_DATE_OF_BIRTH, GENDER, ROLE_SALE, ROLE_SALE_CODE } from '@/configs/consts'
import { AddUserSchema, UpdateUserSchema } from '@/core/zod/updateUser.zod'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MapPinned, Phone, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAddSaleMutation, useUpdateUserMutation } from '@/core/queries/user.query'
import { handleError422 } from '@/utils/handleErrorAPI'
import { useUploadFileMutation } from '@/core/queries/file.query'
import InputPassword from '@/components/InputPassword/InputPassword'
import { useUserQueryConfig } from '@/hooks/useUserQueryConfig'
import { useQueryClient } from '@tanstack/react-query'
import { path } from '@/core/constants/path'

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const schema = isEdit ? UpdateUserSchema : AddUserSchema
  type UserForm = z.infer<typeof schema>
  const form = useForm<UserForm>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          dateOfBirth: new Date(currentRow.dateOfBirth || DEFAULT_DATE_OF_BIRTH),
          gender: currentRow.gender as GENDER_TYPE
        }
      : {
          name: '',
          email: '',
          phone: '',
          address: '',
          gender: GENDER.OTHER as GENDER_TYPE,
          dateOfBirth: new Date(DEFAULT_DATE_OF_BIRTH),
          password: '',
          confirmPassword: ''
        }
  })
  const queryString = useUserQueryConfig(ROLE_SALE)
  const queryClient = useQueryClient()

  const [file, setFile] = useState<File>()
  const fileLocal = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])
  const user = currentRow
  const uploadFileMutation = useUploadFileMutation()
  const userUpdateMutation = useUpdateUserMutation({
    handleError: (error: unknown) => handleError422({ error, form, fieldName: 'email' })
  })

  const addSaleMutation = useAddSaleMutation({
    handleError: (error: unknown) => handleError422({ error, form, fieldName: 'phone' })
  })

  const onSubmit = async (formData: UserForm) => {
    try {
      if (file) {
        const formFile = new FormData()
        formFile.append('file', file)
        const uploadResponse = await uploadFileMutation.mutateAsync({ formData: formFile })
        formData.imageId = uploadResponse.data.data.id
      }
      const dataApi = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString()
      }
      if (isEdit) {
        await userUpdateMutation.mutateAsync(dataApi as UserUpdateRequest)
      } else {
        const dataCreateSale = {
          ...dataApi,
          roleId: ROLE_SALE_CODE
        }
        await addSaleMutation.mutateAsync(dataCreateSale as UserRequest)
        queryClient.invalidateQueries({ queryKey: [path.admin.manage.user, queryString] })
        form.reset()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      // form.reset()
      // onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='md:max-w-3xl'>
        <DialogHeader className='text-left'>
          <DialogTitle className='capitalize text-lg font-bold'>{isEdit ? 'Chỉnh sửa' : 'Thêm mới'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin người dùng.' : 'Tạo mới người dùng.'} Nhấn lưu để thực hiện thay đổi.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 w-full h-[42rem]  overflow-y-auto py-1 px-0.5'>
          <Fragment>
            <Form {...form}>
              <form
                id='user-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='w-full md:w-full space-y-2  mb-10'
                noValidate
              >
                <div className='grid grid-cols-12 gap-4 my-4'>
                  <div className='col-span-12 md:col-span-7 order-2 md:order-1'>
                    {isEdit ? (
                      <div>
                        <Label>Email</Label>
                        <Input
                          disabled
                          value={hideEmail(user?.email)}
                          type='email'
                          className='w-full bg-gray-50 cursor-not-allowed mt-1'
                          icon={<IconMail />}
                        />
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                autoComplete='off'
                                placeholder='Nhập email'
                                type='text'
                                className='w-full focus:outline-0 mt-1'
                                {...field}
                                icon={<IconMail />}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete='off'
                              placeholder='Nhập họ và tên'
                              type='text'
                              className='w-full focus:outline-0 mt-1'
                              {...field}
                              icon={<UserIcon />}
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
                          <FormLabel>Giới tính:</FormLabel>

                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex'>
                              <FormItem className='flex items-center space-x-3 space-y-0'>
                                <FormControl>
                                  <RadioGroupItem value={gender.male} />
                                </FormControl>
                                <FormLabel className='font-normal'>Nam</FormLabel>
                              </FormItem>
                              <FormItem className='flex items-center space-x-3 space-y-0'>
                                <FormControl>
                                  <RadioGroupItem value={gender.female} />
                                </FormControl>
                                <FormLabel className='font-normal'>Nữ</FormLabel>
                              </FormItem>
                              <FormItem className='flex items-center space-x-3 space-y-0'>
                                <FormControl>
                                  <RadioGroupItem value={gender.other} />
                                </FormControl>
                                <FormLabel className='font-normal'>Khác</FormLabel>
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
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete='off'
                              placeholder='Nhập số điện thoại'
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
                          <FormLabel>Ngày sinh</FormLabel>
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
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Nhập địa chỉ'
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
                    <FormField
                      control={form.control}
                      name={'password'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <InputPassword
                              autoComplete='off'
                              placeholder='Nhập mật khẩu'
                              className='w-full focus:outline-0 mt-1'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />

                          <div className='flex flex-col text-sub2 text-gray'>
                            <h4 className=''>Mật khẩu bao gồm:</h4>
                            <ul className='flex flex-col '>
                              <li>- Ít nhất 6 kí tự.</li>
                              <li>- Chữ in hoa, chữ thường và chữ số.</li>
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
                          <FormLabel>Nhập lại mật khẩu</FormLabel>
                          <FormControl>
                            <InputPassword
                              placeholder='Nhập lại mật khẩu'
                              autoComplete='off'
                              className='w-full focus:outline-0 mt-1'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='col-span-12 md:col-span-5 order-1 w-full h-full'>
                    <div className='h-full flex flex-col items-center justify-center gap-6 mo:pt-10 '>
                      <div className='overflow-hidden rounded-full w-35 h-35 shadow'>
                        <img className='w-full h-full object-cover ' src={fileLocal || user?.avatar} alt='avatar' />
                      </div>
                      <InputFile setFile={setFile} />
                      <div className='text-gray-400 text-sm text-left pl-1 pb-4 md:pb-0'>
                        <p>Dung lượng file tối đa 2MB</p>
                        <p>Định dạng .JPEG .PNG</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </Fragment>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='submit'
            loading={userUpdateMutation.isPending || uploadFileMutation.isPending || uploadFileMutation.isPending}
            className='hover:bg-main bg-neutral-700 cursor-pointer'
            form='user-form'
          >
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
