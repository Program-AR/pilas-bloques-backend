import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'
import { Unauthorized } from '../routes/errorHandlers'
import { User } from '../../models/user'

type EncodedPassword = {
  salt: string,
  hashedPassword: string
}

const hashPassword = (password: string, salt: string) =>
  crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), 10000, 64, 'sha512').toString('base64')

export const generatePassword = (password: string): EncodedPassword => {
  const salt = crypto.randomBytes(16).toString('base64')
  const hashedPassword = hashPassword(password, salt)
  return { salt, hashedPassword }
}

export const verifyPassword = (password: string, { salt, hashedPassword }: EncodedPassword) =>
  hashPassword(password, salt) === hashedPassword


type TokenData = {
  id: string
}

type ForoTokenData = {
  id: string,
  username: string,
  email: string
}

const secret = process.env.API_JWT_SECRET || 'test'

export const newToken = (user: User, daysUntilExpiration: number) => generateToken({ id: user._id }, daysUntilExpiration)

export const newForoToken = (user: User): string => {
  const payloadForo: ForoTokenData = {
    id: user._id.toString(),
    username: user.username,
    email: `user_${user._id}@comunidad.pilasbloques.program.ar`
  }

  return jwt.sign(payloadForo, secret, { expiresIn: '1 day' })
}

const generateToken = (data: TokenData, dayUntilExpiration: number): string => jwt.sign(data, secret, { expiresIn: dayUntilExpiration + ' days' })

export const parseToken = (token: string): TokenData => {
  try { return jwt.verify(token, secret) as TokenData }
  catch { throw new Unauthorized() }
}