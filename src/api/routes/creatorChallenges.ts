import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, tryy, onlyIfAuth } from './middlewares'
import { CreatorChallengeModel } from '../../models/creatorChallenge'

const router = express.Router()


router.post('/share', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  body.user = user
  const result = await CreatorChallengeModel.create({...body})
}))


export default router