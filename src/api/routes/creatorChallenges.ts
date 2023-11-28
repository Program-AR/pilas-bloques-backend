import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, tryy, onlyIfAuth } from './middlewares'
import { CreatorChallenge, CreatorChallengeModel } from '../../models/creatorChallenge'

const router = express.Router()

router.post('/share', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  body.user = user

  res.json(await CreatorChallengeModel.create({...body}))
}))

router.get('/sharedChallenge/:_id', (async (req: AuthenticatedRequest, res) => {
  const { _id } = req.params as any
  const challenge = await CreatorChallengeModel.findOne({ _id }).exec()
  res.json(challenge)
}))

router.put('/share/:_id', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { _id } = req.params as any
  const challenge = await CreatorChallengeModel.findOne({ _id }).exec()
  await challenge.set(req.body).save()
  res.json(challenge)
}))


export default router