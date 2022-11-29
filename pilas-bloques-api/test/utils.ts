import * as sinon from 'sinon'
import * as express from 'express'
import * as Request from 'supertest'
import * as mongoose from 'mongoose'
import * as fetchMock from 'fetch-mock'
import router from '../src/routes'
import { connectDB } from '../src/persistence/db'
import { configMailing } from '../src/routes/utils'
import { createTransport } from '../src/mailing'

const analytics = process.env.PB_ANALYTICS_URI
const transportMock = sinon.stub(createTransport())

// SERVER
export type Request = Request.SuperTest<Request.Test>
export const createServer = async () => {
  await connectDB()
  await dropDB()
  const app = express()
  app.use(configMailing(transportMock as any))
  app.use(router)
  return Request(app)
}

// DB
export const dropDB = () => mongoose.connection.dropDatabase()
export const disconnectDB = () => mongoose.disconnect()
export const flushDB = () => {
  mongoose.modelNames().forEach(model => mongoose.deleteModel(model))
}

// URI
export const authenticate = (uri: string, token: string) => `${uri}?access_token=${token}`

// FETCH
export const initFetch = () => {
  fetchMock.reset()
  fetchMock.config.overwriteRoutes = true
  fetchMock.mock(`begin:${analytics}`, 200)
}

// EXPECTATIONS
export const matchBody = <T = any>(expected: T) => (res: { body }) => {
  expect(res.body).toMatchObject(expected)
  return res
}

export const hasBodyProperty = (prop: string) => (res: { body }) => {
  expect(res.body).toHaveProperty(prop)
  return res
}

export const emailSent = (subject: string) => (res: any) => {
  expect(transportMock.sendMail.called).toBeTruthy()
  expect(transportMock.sendMail.firstCall.firstArg).toMatchObject({ subject })
  return res
}


export const fetchCalled = (uri: string) => () =>
  expect(fetchMock.called(`begin:${uri}`)).toBeTruthy()

export const fetchBodyMatch = (expected: any) => () => {
  const [, { body }] = fetchMock.lastCall()
  expect(body).toBe(JSON.stringify(expected))
}

// STRING
export const cApItAlIzE = (word: string) => word.split('').map((char, i) => i % 2 == 1 ? char.toUpperCase() : char.toLowerCase()).join('')