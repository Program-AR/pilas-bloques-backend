import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, tryy, onlyIfAuth } from './middlewares'
import { CreatorChallengeModel } from '../../models/creatorChallenge'

const router = express.Router()

const upsertChallenge = async (_id, user, body) => {
  let challenge = await CreatorChallengeModel.findOne({ _id, user }).exec()
  if (!challenge) {
    challenge = await CreatorChallengeModel.create({ ...body })
  } else {
    await challenge.set(body).save()
  }
  return challenge
}

router.post('/share', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  body.user = user
  res.json(await CreatorChallengeModel.create({ ...body }))
}))

router.get('/sharedChallenge/:_id', (async (req: AuthenticatedRequest, res) => {
  const { _id } = req.params as any
  const challenge = await CreatorChallengeModel.findOne({ _id }).exec()
  res.json(challenge)
}))

router.put('/share/:_id', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { _id } = req.params as any
  const { user, body } = req
  res.json(await upsertChallenge(_id, user, body))
}))


export default router