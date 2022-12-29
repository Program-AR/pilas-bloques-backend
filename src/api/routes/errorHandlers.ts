import * as express from 'express'
import * as mongoose from 'mongoose'
import { MongoError } from 'mongodb'
const { log } = console

type ErrorRequestHandler = express.ErrorRequestHandler
type ValidationError = mongoose.Error.ValidationError
type ServerError = HttpCodeError | ValidationError | MongoError

const serverErrorHandler: ErrorRequestHandler = (err: ServerError, req, res, _next) => {
  if ('httpCode' in err) {
    res.status(err.httpCode).send(err.message)
    return
  }

  if (err instanceof mongoose.mongo.MongoError) {
    res.status(400).send(parseMongoError(err.code))
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).send(parseValidationError(err))
    return
  }

  log("SERVER ERROR", err)
  res.status(500).send("Fatal server error.")
}

const parseValidationError = (err: ValidationError) =>
  Object.values(err.errors).map(e => e.message).join('\n')

const parseMongoError = (code: number | string) => {
  switch (code) {
    case 11000:
      return 'Duplicate key error.'
    default:
      return 'Database error.'
  }
}

export default serverErrorHandler



export class HttpCodeError extends Error {
  httpCode: number

  constructor(code: number, msg?: string) {
    super(msg)
    this.httpCode = code
  }
}

export class Unauthorized extends HttpCodeError {
  constructor(message = 'Unauthorized') {
    super(401, message)
  }
}

export class EntityNotFound extends HttpCodeError {
  constructor(entity: string, id?: any) {
    super(404, `${entity}${id ? `(${id})` : ''} not found.`)
  }
}

export class ClientError extends HttpCodeError {
  constructor(msg: string) {
    super(400, msg)
  }
}

export class ParametersNotFound extends ClientError {
  constructor(label?: string, ...fields: string[]) {
    super(`Missing ${label} parameters: ${fields.join(', ')}`)
  }
}

export class NotFound extends ClientError {
  constructor(label?: string) {
    super(`Missing ${label || 'entity'}`)
  }
}

export class WrongCredentials extends ClientError {
  constructor() {
    super(`Wrong credentials`)
  }
}