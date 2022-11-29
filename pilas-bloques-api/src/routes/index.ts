import * as express from 'express'
import * as cors from 'cors'
import serverErrorHandler from './errorHandlers'
import auth from './auth'
import solutions from './solutions'
import userIp from './ip'

const router = express.Router()

router.use(express.json())
router.use(cors())
router.all('/ping', (_, res) => res.send('pong'))
router.use(auth)
router.use(solutions)
router.use(serverErrorHandler)
router.use(userIp)

export default router