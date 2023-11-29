import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, tryy, onlyIfAuth } from './middlewares'
import { CreatorChallengeModel } from '../../models/creatorChallenge'

const router = express.Router()

router.post('/share', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { user, body } = req
  res.json(await createCreatorChallenge(body, user))
}))

router.get('/sharedChallenge/:sharedId', (async (req: AuthenticatedRequest, res) => {
  const { sharedId } = req.params as any
  const challenge = await CreatorChallengeModel.findOne({ sharedId }).exec()
  res.json(challenge)
}))

router.put('/share/:sharedId', tryy(tokenAuth), onlyIfAuth, syncHandler(async (req: AuthenticatedRequest, res) => {
  const { sharedId } = req.params as any
  const { user, body } = req
  res.json(await upsertChallenge(sharedId, user, body))
}))


const upsertChallenge = async (sharedId, user, body) => {
  let challenge = await CreatorChallengeModel.findOne({ sharedId, user }).exec()
  if (!challenge) {
    challenge = await createCreatorChallenge(body, user)
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
  const mapping: string = 'abcdefghijklmnopqrstuvwxyz';
  const alpha: string[] = [];
  let remainingNum: number = num - 1;
  while (remainingNum >= 0) {
    alpha.push(mapping[remainingNum % 26]);
    remainingNum = Math.floor(remainingNum / 26) - 1;
  }
  return alpha.reverse().join('');
}

const existChallengeWithSharedId = async (sharedId) => await CreatorChallengeModel.exists({ sharedId })

const generateUniqueChallengeSharedId = async () => {
  let sharedId

  do {
    sharedId = generateChallengeID()
  } while (await existChallengeWithSharedId(sharedId))

  return sharedId
}

const createCreatorChallenge = async (body, user) => {
  const sharedId = await generateUniqueChallengeSharedId()
  return await CreatorChallengeModel.create({ ...body, user, sharedId })
}


export default router