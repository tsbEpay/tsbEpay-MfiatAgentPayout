import { Request, Response, NextFunction } from 'express'
import { AuthRequest, successResponse } from '../../types'
import * as authService from '../../services/agent/authService'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await authService.register(req.body)
    res.status(201).json(successResponse('Account created. Please verify your email address', data))
  } catch (err) {
    next(err)
  }
}


export const verifyOtp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await authService.verifyOtp(req.agent!.agentId, req.body.code)
    res.json(successResponse(data.message))
  } catch (err) {
    next(err)
  }
}


export const resendOtp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await authService.resendOtp(req.agent!.agentId)
    res.json(successResponse('OTP resent successfully', data))
  } catch (err) {
    next(err)
  }
}


export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await authService.login({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })
    res.json(successResponse('Login successful', data))
  } catch (err) {
    next(err)
  }
}


export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await authService.refreshToken(req.body.refreshToken)
    res.json(successResponse('Token refreshed', data))
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.forgotPassword(req.body)
    res.json(
successResponse(
      'If your email is registered, a password reset code will be sent.'
    )
    )
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.resetPassword(req.body)
    res.json(successResponse('Password has been reset successfully'))
  } catch (err) {
    next(err)
  }
}

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.logout(req.agent!.sessionId)
    res.json(successResponse('Logged out successfully'))
  } catch (err) {
    next(err)
  }
}


export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await authService.getProfile(req.agent!.agentId)
    res.json(successResponse('Profile retrieved', data))
  } catch (err) {
    next(err)
  }
}