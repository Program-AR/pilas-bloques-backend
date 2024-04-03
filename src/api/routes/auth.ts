import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { generatePassword, verifyPassword, newToken, parseToken } from '../models/auth'
import { tokenAuth, requiredBody, requiredQueryParams, passwordChangeAuth } from './middlewares'
import { WrongCredentials } from './errorHandlers'
import { passwordRecoveryMail } from '../mailing/mails'
import { User, UserModel } from '../../models/user'

const LOGIN_EXPIRATION_DAYS = parseInt(process.env.LOGIN_EXPIRATION_DAYS)

const toJsonUser = (user: User) => ({ id: user._id, token: newToken(user,LOGIN_EXPIRATION_DAYS), ...user.profile, answeredQuestionIds: user.answeredQuestionIds, experimentGroup: user.experimentGroup })

const router = express.Router()

router.post('/register', requiredBody('username', 'password'), syncHandler(async ({ body }: AuthenticatedRequest, res) => {
  const username = UserModel.standarizeIdentifier(body.username)
  const experimentGroup = body.context.experimentGroup
  const user = await UserModel.create({ ...body, experimentGroup, username, ...generatePassword(body.password) })
  res.json(toJsonUser(user))
}))

router.post('/login', requiredBody('username', 'password'), syncHandler(async ({ body }: AuthenticatedRequest, res) => {
  const user = await UserModel.findByUsername(body.username).exec()
  if (!user || !verifyPassword(body.password, user)) throw new WrongCredentials()
  res.json(toJsonUser(user))
}))

router.put('/credentials', requiredBody('password'), passwordChangeAuth, syncHandler(async ({ user, body }: AuthenticatedRequest, res) => {
  await user.set(generatePassword(body.password)).save()
  res.json(toJsonUser(user))
}))

router.post('/password-recovery', requiredQueryParams('userIdentifier'), syncHandler(async ({ query, transport }: AuthenticatedRequest, res) => {
  const userIdentifier = query['userIdentifier'] as string
  const identifierIsMail = userIdentifier.includes('@')
  const user = identifierIsMail ? await UserModel.findByEmail(userIdentifier).exec() : await UserModel.findByUsername(userIdentifier).exec()
  
  if (user && user.email) await transport.sendMail(passwordRecoveryMail(user))
  res.json(toJsonUser(user))
}))

router.post('/answers', tokenAuth, requiredBody('question', 'response'), syncHandler(async ({ user, body }: AuthenticatedRequest, res) => {
  user.answers.push(body)
  await user.save()
  res.json(toJsonUser(user))
}))

router.get('/profile', tokenAuth, syncHandler(async ({ user }: AuthenticatedRequest, res) => {
  res.json(user.profile)
}))

router.put('/experiment-group', tokenAuth, requiredBody('group'), syncHandler(async ({ user, body }: AuthenticatedRequest, res) => {
  user.experimentGroup = body.group
  await user.save()
  res.json(toJsonUser(user))
}))

router.get('/users/exists', requiredQueryParams('username'), syncHandler(async ({ query }: AuthenticatedRequest, res) => {
  const user = await UserModel.findByUsername(query['username'] as string).exec()
  res.json(Boolean(user))
}))

router.post('/valid-token', requiredQueryParams('token'), syncHandler(async ({ query }: AuthenticatedRequest, res) => {
  const { id } = parseToken(query['token'] as string)
  const user = await UserModel.findById(id).exec()
  
  res.json(Boolean(user))
}))

export default router