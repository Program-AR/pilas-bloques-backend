import * as express from 'express'
import * as uuid from 'uuid'
import { syncHandler, ResourceRequest } from './utils'
import { EntityNotFound } from './errorHandlers'
import { CompleteSolutionModel } from '../../models/solution'
import { ChallengeModel } from '../../models/challenge'

type ChallengeRequest = ResourceRequest<'solution'>
const cookieParser = require('cookie-parser')

const router = express.Router()

router.use(cookieParser())

const userFingerprint = (req: ChallengeRequest, res, next) => {
    let fingerprint = req.cookies ? req.cookies.fingerprint : null

    const maxAge = 1000 * 60 * 60 * 24 * parseInt(process.env.COOKIE_MAX_AGE_DAYS)
    const secure = Boolean(process.env.COOKIE_SECURE)

    if(!fingerprint){
      fingerprint = uuid.v4()
      res.cookie('fingerprint', fingerprint, {
        httpOnly: true,
        secure: secure,
        maxAge: maxAge
      });
    }

    req.body.context.browserId = fingerprint
    next()
}

router.param('solutionId', async (req: ChallengeRequest, res, next, id) => {
  const solution = await CompleteSolutionModel.findOne({ solutionId: id })
  if (!solution) return next(new EntityNotFound('Solution', id))
  req.solution = solution
  next()
})

router.post('/challenges', userFingerprint, syncHandler(async (req: ChallengeRequest, res) => {
  const challenge = await ChallengeModel.create(req.body)
  res.json(challenge)
}))

router.post('/solutions', userFingerprint, syncHandler(async (req: ChallengeRequest, res) => {
  const solution = await CompleteSolutionModel.create(req.body)
  const { challengeId, context: { id } } = solution
  await ChallengeModel.setFirstSolution(challengeId, id, solution)
  res.json(solution)
}))

router.put('/solutions/:solutionId', userFingerprint, syncHandler(async (req: ChallengeRequest, res) => {
  req.solution.set(req.body)
  await req.solution.save()
  res.json(req.solution)
}))

export default router