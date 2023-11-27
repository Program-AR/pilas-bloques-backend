import * as express from 'express'
import serverErrorHandler from './errorHandlers'
import auth from './auth'
import solutions from './solutions'
import userIp from './ip'
import status from '../../utils/status'
import creatorChallenges from './creatorChallenges'

const router = express.Router()

router.use(express.json())
router.use(status('pilas-bloques-api'))
router.use(auth)
router.use(solutions)
router.use(creatorChallenges)
router.use(serverErrorHandler)
router.use(userIp)

export default router