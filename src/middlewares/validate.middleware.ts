import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from '../types'

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return next(
        new ValidationError('Validation failed', {
          issues: result.error.issues,
          message: result.error.issues.map((e) => e.message).join(', '),
        })
      )
    }

    req.body = result.data
    next()
  }