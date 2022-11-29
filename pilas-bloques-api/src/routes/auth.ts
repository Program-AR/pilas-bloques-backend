import * as express from 'express'
import { syncHandler, ofuscate, AuthenticatedRequest } from './utils'
import { User, UserModel } from 'pilas-bloques-models'
import { generatePassword, verifyPassword, newToken } from '../models/auth'
import { tokenAuth, requiredBody, requiredQueryParams, passwordChangeAuth } from './middlewares'
import { HttpCodeError, WrongCredentials } from './errorHandlers'
import { passwordRecoveryMail } from '../mailing/mails'

const LOGIN_EXPIRATION_DAYS = parseInt(process.env.LOGIN_EXPIRATION_DAYS)

const toJsonUser = (user: User) => ({ id: user._id, token: newToken(user,LOGIN_EXPIRATION_DAYS), ...user.profile, answeredQuestionIds: user.answeredQuestionIds, experimentGroup: user.experimentGroup })

const router = express.Router()

router.post('/register', requiredBody('username', 'password'), syncHandler(async ({ body }: AuthenticatedRequest, res) => {
  const username = UserModel.standarizeUsername(body.username)
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

router.post('/password-recovery', requiredQueryParams('username'), syncHandler(async ({ query, transport }: AuthenticatedRequest, res) => {
  const user = await UserModel.findByUsername(query['username'] as string).exec()
  if (!user) throw new HttpCodeError(404, "User does not exist")
  if (user.email) await transport.sendMail(passwordRecoveryMail(user))
  res.json({ email: user.email ? ofuscate(user.email) : null })
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

export default router