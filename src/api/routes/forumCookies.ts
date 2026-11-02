import * as express from 'express'
import { newForoToken } from '../models/auth'
import { User } from '../../models/user'

const LOGIN_EXPIRATION_DAYS = parseInt(process.env.LOGIN_EXPIRATION_DAYS) || 30

export const setForoCookie = (res: express.Response, user: User) => {
  const isProd = process.env.NODE_ENV === 'production'

  res.cookie('foro_session', newForoToken(user), {
    httpOnly: true,
    secure: isProd,
    ...(isProd && { domain: process.env.COOKIE_DOMAIN || '.program.ar' }),
    maxAge: LOGIN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    path: '/'
  })
}

export const clearForoCookie = (res: express.Response) => {
  const isProd = process.env.NODE_ENV === 'production'

  res.clearCookie('foro_session', {
    httpOnly: true,
    secure: isProd,
    ...(isProd && { domain: process.env.COOKIE_DOMAIN || '.program.ar' }),
    path: '/'
  })
}
