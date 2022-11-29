import * as express from 'express'
import * as mongoose from 'mongoose'

export type RequestHandler = express.RequestHandler

export const syncHandler = (handler: RequestHandler): RequestHandler => async (req, res, next) => {
  try {
    await handler(req, res, next)
  } catch (err) {
    next(err)
  }
}

export type ResourceRequest<Resource extends keyof any> = express.Request & { 
  [P in Resource]: mongoose.Document 
}
