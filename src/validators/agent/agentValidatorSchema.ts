import { z } from 'zod'

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .trim(),

    lastName: z
      .string()
      .min(1, 'Surname is required')
      .min(2, 'Surname must be at least 2 characters')
      .trim(),

    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    phone: z
      .string()
      .min(1, 'Phone number is required')
      .min(7, 'Please enter a valid phone number')
      .trim(),

    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      error: 'Gender must be MALE, FEMALE or OTHER',
    }),

    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers and underscores'
      )
      .trim(),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Minimum of 8 characters')
      .regex(/[0-9]/, 'Must contain one number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain one symbol'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    country: z
      .string()
      .min(1, 'Country is required')
      .length(2, 'Country must be a 2-letter code e.g NG, GH, KE')
      .toUpperCase(),

    referredBy: z.string().trim().optional(),

    agreedToTerms: z.literal(true, {
      error: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const verifyOtpSchema = z.object({

  code: z
    .string()
    .min(1, 'OTP code is required')
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain digits only'),
})

export const resendOtpSchema = z.object({})

export const loginSchema = z
  .object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim()
      .optional(),

    phone: z
      .string()
      .min(1, 'Phone number is required')
      .min(7, 'Please enter a valid phone number')
      .trim()
      .optional(),

    password: z
      .string()
      .min(1, 'Password is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Email or phone is required',
    path: ['email'],
  })

export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ResendOtpInput = z.infer<typeof resendOtpSchema>
export type LoginInput = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
})

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),

    code: z
      .string()
      .min(1, 'Reset code is required')
      .length(6, 'Reset code must be 6 digits')
      .regex(/^\d+$/, 'Reset code must contain digits only'),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Minimum of 8 characters')
      .regex(/[0-9]/, 'Must contain one number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain one symbol'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type RefreshInput = z.infer<typeof refreshSchema>