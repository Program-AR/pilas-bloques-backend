// SERVER
import * as express from 'express'

// ENV VAR
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import * as cors from 'cors'
const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)
console.log(myEnv)

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
const port = process.env.API_PORT
const app = express()
app.set('trust proxy', true) // If true, the client’s IP address is understood as the left-most entry in the X-Forwarded-* header.
app.use(configMailing(transport))

const whitelist = [process.env.API_APP_ORIGIN_URL]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`))
    }
  },
  optionsSuccessStatus: 200,
  credentials:true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}

app.use(cors(corsOptions))
app.use(routes)
app.listen(port, () => {
  log(`Server started at ${port}`)
})