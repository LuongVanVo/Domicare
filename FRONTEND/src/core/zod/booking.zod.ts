import { z } from 'zod'

export const BookingSchema = z.object({
  guestEmail: z
    .string()
    .trim()
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email không đúng định dạng.'
    })
    .transform((val) => (val === '' ? undefined : val))
    .optional(),
  phone: z
    .string()
    .min(10, { message: 'Số điện thoại không được để trống hoặc không hợp lệ.' })
    .regex(/^\d+$/, { message: 'Số điện thoại chỉ được chứa số.' }),

  name: z.string().min(2, { message: 'Họ tên không được để trống.' }),

  address: z.string().min(5, { message: 'Địa chỉ không được để trống.' }),

  startTime: z.date({ message: 'Ngày không được để trống.' }),

  note: z.string().optional(),
  isPeriodic: z.enum(['true', 'false'])
})

// ke thua tu phia tren
export const ActionBookingSchema = BookingSchema.extend({
  status: z.enum(['PENDING', 'ACCEPTED', 'FAILED', 'SUCCESS', 'REJECTED', 'CANCELLED']),
  productId: z.number()
})

// Export type từ schema
export type BookingForm = z.infer<typeof BookingSchema>
export type ActionBookingForm = z.infer<typeof ActionBookingSchema>
