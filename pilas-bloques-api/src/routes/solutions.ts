import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, mirrorTo, tryy, onlyIfAuth, end } from './middlewares'
import { BaseSolutionModel } from 'pilas-bloques-models'

const router = express.Router()

const mirror = mirrorTo(process.env.PB_ANALYTICS_URI)

router.post('/challenges', mirror, end)

router.get('/challenges/:challengeId/solution', tokenAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user } = req
  const { challengeId } = req.params as any
  const solution = await BaseSolutionModel.findOne({ challengeId, user }).exec()
  res.json(solution)
}))

router.post('/solutions', mirror, tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  const { challengeId } = body
  body.user = user
  const result = await BaseSolutionModel.updateOne({ challengeId, user }, body, { upsert: true }).exec()
  res.json(result) // TODO: Retrieve solution?
}))

router.put('/solutions/:solutionId', mirror, tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { solutionId } = req.params as any
  const solution = await BaseSolutionModel.findOne({ solutionId }).exec()
  await solution.set(req.body).save()
  res.json(solution)
}))

export default router