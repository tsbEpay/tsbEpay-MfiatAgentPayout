import { Request } from 'express'
export interface JwtPayload {
  agentId: string
  sessionId: string
}


export interface AuthRequest extends Request {
  agent?: {
    agentId: string
    sessionId: string
  }
}

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
}

export const apiResponse = <T = null>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> => ({
  success,
  message,
  data,
})

export const successResponse = <T>(
  message: string,
  data?: T
): ApiResponse<T> => apiResponse(true, message, data)

export const errorResponse = <T = null>(
  message: string,
  data?: T
): ApiResponse<T> => apiResponse(false, message, data)

export class AppError extends Error {
  statusCode: number
  data?: unknown

  constructor(message: string, statusCode = 500, data?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    // keeps the prototype chain correct in TypeScript
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', data?: unknown) {
    super(message, 400, data)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', data?: unknown) {
    super(message, 401, data)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', data?: unknown) {
    super(message, 403, data)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found', data?: unknown) {
    super(message, 404, data)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', data?: unknown) {
    super(message, 409, data)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', data?: unknown) {
    super(message, 422, data)
  }
}
