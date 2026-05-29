import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, { message: 'Tên danh mục không được để trống.' }),
  description: z.string().optional(),
  imageId: z.string().optional()
})

export type CategoryForm = z.infer<typeof categorySchema>
