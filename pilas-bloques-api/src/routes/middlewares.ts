import { syncHandler, RequestHandler, AuthenticatedRequest } from './utils'
import { DocumentType } from '@typegoose/typegoose'
import { UserModel, User } from 'pilas-bloques-models'
import { parseToken } from '../models/auth'
import { NotFound, ParametersNotFound, Unauthorized, WrongCredentials } from './errorHandlers'

export const tokenAuth = syncHandler(async (req: AuthenticatedRequest, _res, next) => {
  req.user = await authByToken(accessToken(req))
  next()
})

export const passwordChangeAuth = syncHandler(async (req: AuthenticatedRequest, _res, next) => {
  let user: DocumentType<User>
  const body = req.body
  if (body.token) {
    user = await authByToken(body.token)
  } else {
    required(body, 'body', ['username', 'parentDNI'])
    user = await authByparentDNI(body)
  }
  req.user = user
  next()
})

const authByToken = async (token: string) => {
  const { id } = parseToken(token)
  const user = await UserModel.findById(id).exec()
  if (!user) throw new Unauthorized()
  return user
}

const authByparentDNI = async (body: { username: string, parentDNI: string }) => {
  const user = await UserModel.findByUsername(body.username).exec()
  if (!user || user.parentDNI !== body.parentDNI) throw new WrongCredentials()
  return user
}

const accessToken = (req: AuthenticatedRequest): string => {
  const token = req.query['access_token'] as string || req.header('authorization')?.replace('Bearer ', '')
  if (!token) throw new NotFound('access token')
  return token
}

export const requiredBody = (...fields: string[]) => syncHandler(async (req: AuthenticatedRequest, _res, next) => {
  required(req.body, 'body', fields)
  next()
})


export const requiredQueryParams = (...fields: string[]) => syncHandler(async (req: AuthenticatedRequest, _res, next) => {
  required(req.query, 'query', fields)
  next()
})

const required = (data: any, label: string, fields: string[]) => {
  if (!data) throw (new NotFound(label))
  if (!fields.every(field => data[field])) throw (new ParametersNotFound(label, ...fields.filter(field => !data[field])))
}

export const mirrorTo = (url: string): RequestHandler => (req, _res, next) => {
  const data = {
    method: req.method,
    body: JSON.stringify(req.body),
    headers: Object.entries(req.headers) as string[][]
  }
  fetch(url + req.path, data).catch(err => {
    console.log("MIRRORING FAILED", err)
  })
  next()
}

export const tryy = (handler: RequestHandler): RequestHandler => (req, _res, next) => {
  try {
    handler(req, _res, () => next())
  } catch {
    next()
  }
}

export const onlyIfAuth: RequestHandler = (req: AuthenticatedRequest, res, next) => {
  if (req.user) { next() } else { res.end() }
}

export const end: RequestHandler = (req: AuthenticatedRequest, res) => {
  res.end()
}