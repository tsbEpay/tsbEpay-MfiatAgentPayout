import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types/auth/jwtType'

export const signAccessToken = (
  payload: JwtPayload
): string => {
  return jwt.sign(
    payload,
    env.JWT_SECRET as Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    }
  )
}

export const signRefreshToken = (
  payload: JwtPayload
): string => {
  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET as Secret,
    {
      expiresIn:
        env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    }
  )
}

export const verifyRefreshToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    env.JWT_REFRESH_SECRET
  ) as JwtPayload
}