import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, mirrorTo, tryy, onlyIfAuth, end, userFingerprint } from './middlewares'
import { BaseSolutionModel } from '../../models/solution'
import * as cookieParser from 'cookie-parser'

const router = express.Router()

router.use(cookieParser())

const mirror = mirrorTo(process.env.API_PB_ANALYTICS_URI)

router.post('/challenges', userFingerprint, mirror, end)

router.get('/challenges/:challengeId/solution', tokenAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user } = req
  const { challengeId } = req.params as any
  const solution = await BaseSolutionModel.findOne({ challengeId, user }).exec()
  res.json(solution)
}))

router.post('/solutions', userFingerprint, mirror, tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  const { challengeId } = body
  body.user = user
  const result = await BaseSolutionModel.updateOne({ challengeId, user }, body, { upsert: true }).exec()
  res.json(result) // TODO: Retrieve solution?
}))

router.put('/solutions/:solutionId', userFingerprint, mirror, tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { solutionId } = req.params as any
  const solution = await BaseSolutionModel.findOne({ solutionId }).exec()
  await solution.set(req.body).save()
  res.json(solution)
}))

export default router