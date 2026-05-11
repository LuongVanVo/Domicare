import { z } from 'zod'

export const SearchChema = z.object({
  name: z.string().min(2)
})

export const productSchema = z.object({
  categoryId: z.number({ message: 'Danh mục không được để trống' }),
  name: z.string().min(2, { message: 'Tên dịch vụ không được để trống.' }),
  description: z.string().optional(),
  mainImageId: z.string({ message: 'Ảnh chính không được để trống.' }).optional(),
  price: z
    .number({ message: 'Giá sản phẩm không được để trống.' })
    .min(1000, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 1000VND.' }),

  discount: z
    .number({ message: 'Giảm giá không được để trống.' })
    .min(0, { message: 'Giảm giá phải lớn hơn hoặc bằng 0%.' })
    .max(100, { message: 'Giảm giá phải nhỏ hơn 100%.' }),
  oldProductId: z.number().optional(),
  oldCategoryId: z.number().optional()
})

// Type từ schema

export type ProductForm = z.infer<typeof productSchema>
