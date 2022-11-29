// SERVER
import * as express from 'express'

// ENV VAR
import * as dotenv from 'dotenv'
dotenv.config() // Do first!

// GLOBALS
import fetch from 'node-fetch'
global.fetch = fetch as any

// DB
import { connectDB } from './persistence/db'
connectDB()

// Mail
import {createTransport} from './mailing'
const transport = createTransport()

// API
import routes from './routes'
import { configMailing } from './routes/utils'

const { log } = console
const port = process.env.PORT
const app = express()
app.set('trust proxy', true) // If true, the client’s IP address is understood as the left-most entry in the X-Forwarded-* header.
app.use(configMailing(transport))
app.use(routes)
app.listen(port, () => {
  log(`Server started at ${port}`)
})