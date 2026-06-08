import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import  prisma  from '../lib/prisma'
import { AuthRequest, JwtPayload, UnauthorizedError } from '../types'

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }
    const token = authHeader.split(' ')[1]
    let payload: JwtPayload

    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token')
    }

    
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    })

    if (!session) {
      throw new UnauthorizedError('Session has expired, please login again')
    }

    const agent = await prisma.agent.findUnique({
      where: { id: payload.agentId },
      select: { id: true, isActive: true },
    })

    if (!agent || !agent.isActive) {
      throw new UnauthorizedError('Account not found or has been deactivated')
    }

    req.agent = {
      agentId: payload.agentId,
      sessionId: payload.sessionId,
    }

    next()
  } catch (err) {
    next(err)
  }
}