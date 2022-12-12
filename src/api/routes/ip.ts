import * as express from 'express'
import { syncHandler } from './utils'

const router = express.Router()

router.get('/user-ip', syncHandler(async (req, res) => {
    res.json({ ip: req.ip })
}))

export default router