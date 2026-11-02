import * as express from 'express'
import serverErrorHandler from './errorHandlers'
import auth from './auth'
import forum from './forum'
import solutions from './solutions'
import userIp from './ip'
import status from '../../utils/status'
import userChallenges from './userChallenges'

const router = express.Router()

router.use(express.json())
router.use(status('pilas-bloques-api'))
router.use(auth)
router.use('/forum', forum)
router.use(solutions)
router.use(userChallenges)
router.use(serverErrorHandler)
router.use(userIp)

export default router