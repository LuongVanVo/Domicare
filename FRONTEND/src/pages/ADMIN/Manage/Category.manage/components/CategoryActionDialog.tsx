'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Category } from '@/models/interface/category.interface'
import { CategoryForm, categorySchema } from '@/core/zod/category.zod'
import { FolderPen } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { categoryApi } from '@/core/services/category.service'
import { useCategoryMutation } from '@/core/queries/product.query'
import { handleError422 } from '@/utils/handleErrorAPI'
import { useUploadFileMutation } from '@/core/queries/file.query'
import InputImage from '@/components/InputImage'

interface Props {
  currentRow?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: isEdit
      ? {
          ...currentRow
        }
      : {
          name: '',
          description: ''
        }
  })

  const [file, setFile] = useState<string>(currentRow?.image || '')

  const uploadFileMutation = useUploadFileMutation()
  const mutationFn = isEdit ? categoryApi.edit : categoryApi.add
  const categoryMutation = useCategoryMutation({ mutationFn })

  const onSubmit = async (data: CategoryForm) => {
    try {
      // submit form
      const dataAPI = {
        ...data,
        imageId: file,
        categoryId: isEdit ? currentRow.id : null
      }
      await categoryMutation.mutateAsync(dataAPI)
      form.reset()
      setFile('')
      onOpenChange(false)
    } catch (error) {
      handleError422({ error, form, fieldName: 'imageId' })
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle className='capitalize text-lg font-bold'>{isEdit ? 'Chỉnh sửa' : 'Thêm mới'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin của danh mục. ' : 'Tạo mới danh mục. '}
            Nhấn lưu để thực hiện thay đổi.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='category-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-0.5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Tên danh mục</FormLabel>
                    <FormControl>
                      <div className='col-span-4'>
                        <Input placeholder='Nhập tên danh mục' icon={<FolderPen />} autoComplete='off' {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập mô tả'
                        className='col-span-4 min-h-35'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='imageId'
                render={() => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Hình ảnh</FormLabel>
                    <div className='col-span-4 h-45 border border-gray-200 shadow rounded-sm overflow-hidden bg-bg relative '>
                      <InputImage value={file} setValues={setFile} />
                    </div>
                    <div> {form.formState.errors.imageId?.message}</div>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='submit'
            loading={categoryMutation.isPending || uploadFileMutation.isPending}
            className='hover:bg-main bg-neutral-700 cursor-pointer'
            form='category-form'
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
