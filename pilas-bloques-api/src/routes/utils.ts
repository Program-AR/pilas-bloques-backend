import * as express from 'express'
import * as nodemailer from 'nodemailer'
import { DocumentType } from '@typegoose/typegoose'
import { User } from 'pilas-bloques-models'

export type AuthenticatedRequest = express.Request & { user: DocumentType<User> } & { transport: nodemailer.Transporter }

export type RequestHandler = express.RequestHandler

export const syncHandler = (handler: RequestHandler): RequestHandler => async (req, res, next) => {
  try {
    await handler(req, res, next)
  } catch (err) {
    next(err)
  }
}

export const configMailing = (transport: nodemailer.Transporter) => {
  const router = express.Router()
  router.use(syncHandler((req: AuthenticatedRequest, _res, next) => {
    req.transport = transport
    next()
  }))
  return router
}

export const ofuscate = (email: string) => {
  const [user, server] = email.split('@')
  const init = user[0]
  const last = user.split('').reverse()[0]
  const ofuscatedCount = user.length - 2
  return `${init}${'*'.repeat(ofuscatedCount)}${last}@${server}`
}