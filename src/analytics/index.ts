import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import * as express from 'express'
import * as mongoose from 'mongoose'
import routes from './routes'
const { log } = console

const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)
console.log(myEnv)

// DB
const dbUri = process.env.ANALYTICS_DB_CONNECTION_URI
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

// SERVER
const port = process.env.ANALYTICS_PORT
const app = express()
app.use(routes)
app.listen(port, () => {
  log(`Server started at ${port}`)
})