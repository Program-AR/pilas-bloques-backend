import * as express from 'express'
import * as cors from 'cors'
import serverErrorHandler from './errorHandlers'
import exercises from './exercises'
import status from '../../status'

const router = express.Router()

router.use(express.json())
router.use(status('pilas-bloques-analytics'))
router.use(cors())
router.all('/ping', (_, res) => res.send('pong'))
router.use(exercises)
router.use(serverErrorHandler)

export default router