import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, tryy, onlyIfAuth } from './middlewares'
import { UserChallengeModel as UserChallengeModel } from '../../models/creatorChallenge'

const router = express.Router()

router.post('/userChallenge', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  res.json(await createUserChallenge(body, user))
}))

router.get('/userChallenge/:sharedId', (async (req: AuthenticatedRequest, res) => {
  const { sharedId } = req.params as any
  const challenge = await UserChallengeModel.findOne({ sharedId }).exec()
  res.json(challenge)
}))

router.put('/userChallenge/:sharedId', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { sharedId } = req.params as any
  const { user, body } = req
  res.json(await upsertChallenge(sharedId, user, body))
}))


const upsertChallenge = async (sharedId, user, body) => {
  let challenge = await UserChallengeModel.findOne({ sharedId, user }).exec()
  if (!challenge) {
    challenge = await createUserChallenge(body, user)
  } else {
    await challenge.set(body).save()
  }
  return challenge
}

function generateChallengeID(): string {
  const nowTimestamp: number = Date.now() - Date.UTC(2023, 0, 1)
  return nowTimestamp.toString()
}

const createUserChallenge = async (body, user) => {
  const sharedId = generateChallengeID()
  return await UserChallengeModel.create({ ...body, user, sharedId })
}


export default router