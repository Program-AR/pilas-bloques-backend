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
  return numToAlpha(nowTimestamp)
}

function numToAlpha(num: number): string {
  const mapping = '012345679' //We dont use letters to prevent offensive words. We removed the 8 for the same reason.
  const alpha: string[] = []
  let remainingNum: number = num - 1
  while (remainingNum >= 0) {
    alpha.push(mapping[remainingNum % 9])
    remainingNum = Math.floor(remainingNum / 9) - 1
  }
  return alpha.reverse().join('')
}

const existChallengeWithSharedId = async (sharedId) => await UserChallengeModel.exists({ sharedId })

const generateUniqueChallengeSharedId = async () => {
  let sharedId

  do {
    sharedId = generateChallengeID()
  } while (await existChallengeWithSharedId(sharedId))

  return sharedId
}

const createUserChallenge = async (body, user) => {
  const sharedId = await generateUniqueChallengeSharedId()
  return await UserChallengeModel.create({ ...body, user, sharedId })
}


export default router