import { Request, Response, NextFunction } from 'express'
import { AppError, errorResponse } from '../types'

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.data))
  }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.error('[Unhandled Error]', err)
  }
  return res.status(500).json(errorResponse('Something went wrong'))
}

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Route ${req.method} ${req.path} not found`))
}