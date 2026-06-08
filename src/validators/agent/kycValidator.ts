import { z } from 'zod'

export const reviewSchema = z.object({
  status: z
    .string()
    .min(1, 'Status is required')
    .pipe(
      z.enum(['APPROVED', 'REJECTED'], {
        error: 'Status must be APPROVED or REJECTED',
      })
    ),

  reviewNote: z.string().trim().optional(),
})