import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, tryy, onlyIfAuth } from './middlewares'
import { CreatorChallengeModel } from '../../models/creatorChallenge'

const router = express.Router()

const upsertChallenge = async (_id, user, body) => {
  let challenge = await CreatorChallengeModel.findOne({ _id, user}).exec()
  if (!challenge) {
    challenge = await createCreatorChallenge(body, user)
  } else {
    await challenge.set(body).save()
  }
  return challenge
}

const createCreatorChallenge = async (body, user) => await CreatorChallengeModel.create({ ...body, user })

router.post('/share', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  res.json(await createCreatorChallenge(body, user))
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