import { Router } from 'express'

import { validate } from '../../middlewares/validate.middleware'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as authController from '../../controllers/agent/authController'
import {loginSchema,refreshSchema,registerSchema,verifyOtpSchema,forgotPasswordSchema,resetPasswordSchema} from '../../validators/agent/agentValidatorSchema'
import { authLimiter } from '../../middlewares/authRateLimiter.middleware'

const agentRoutes = Router();

agentRoutes.post('/register', authLimiter, validate(registerSchema), authController.register)
agentRoutes.post('/verify-otp', authLimiter, authMiddleware, validate(verifyOtpSchema), authController.verifyOtp)
agentRoutes.post('/resend-otp', authLimiter, authMiddleware, authController.resendOtp)
agentRoutes.post('/login', authLimiter, validate(loginSchema), authController.login)
agentRoutes.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh)
agentRoutes.post('/logout', authMiddleware, authController.logout)
agentRoutes.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword)
agentRoutes.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword)
agentRoutes.get('/me', authMiddleware, authController.getProfile)

export default agentRoutes;