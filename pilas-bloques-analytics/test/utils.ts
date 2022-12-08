import * as express from 'express'
import * as Request from 'supertest'
import * as mongoose from 'mongoose'
import router from '../src/routes'
import { Challenge, CompleteSolution, Context, User } from 'pilas-bloques-models'

export type Request = Request.SuperTest<Request.Test>

export const createServer = async () => {
  await connectDB()
  await dropDB()
  const app = express()
  app.use(router)
  return Request(app)
}

export const connectDB = () =>
  mongoose.connect('mongodb://localhost/pilas-bloques-analytics-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })

export const dropDB = () => mongoose.connection.dropDatabase()
export const disconnectDB = () => mongoose.disconnect()

export const flushDB = () => {
  mongoose.modelNames().forEach(model => mongoose.deleteModel(model))
}

// EXPECTATIONS
export const matchBody = <T = any>(expected: T) => (res: Request.Response) => {
  // Stringify + Parse to convert to JSON types (dates as strings, etc)
  expect(res.body).toMatchObject(JSON.parse(JSON.stringify(expected)))
}

// MOCKS

const username = "TEST_ID"
const solutionId = "007"
const challengeId = "1"

export const context: Context = {
  online: true,
  browserId: "123",
  id: "HASH",
  userId: "123",
  answers: [],
  experimentGroup: 'treatment',
  url: '',
  ip: '199.199.199.199',
  version: '7.27.78x',
  locale: 'es-ar',
  usesNightTheme: true,
  usesSimpleRead: false,
  usesFullScreen: false,
  solvedChallenges: []
}
export const userJson: Partial<User> = {
  username,
  salt: 'asd',
  hashedPassword: 'Dvl9i34mkvgoi',
  parentName: 'Pepita',
  parentDNI: '123546345'
}

export const executionResultJson = {
  isTheProblemSolved: true,
  stoppedByUser: false,
  error: '' as any
}

export const solutionJson: CompleteSolution = {
  challengeId,
  solutionId,
  program: "XML",
  ast: [],
  staticAnalysis: {
    couldExecute: true,
    allExpectResults: [],
    score: {
      expectResults: {
        solution_works: false
      },
      percentage: 0
    },
    error: ''
  },
  context,
  timestamp: new Date(),
  turboModeOn: false,
  executionResult: executionResultJson,
  user: '53cb6b9b4f4ddef1ad47f943',
}

export const challengeJson: Challenge = {
  challengeId,
  context,
  timestamp: new Date()
}