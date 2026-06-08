export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  username: string
  password: string
  confirmPassword: string
  referredBy?: string
  country: string
  agreedToTerms: boolean
}

export interface VerifyOtpDto {
  code: string
}

export interface LoginDto {
  email?: string
  phone?: string
  password: string
  ipAddress?: string
  userAgent?: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  email: string
  code: string
  password: string
  confirmPassword: string
}