import * as mongoose from 'mongoose'
import { connectDB } from '../../src/analytics-consumer/persistence/connect'
import { CompleteSolution as Solution } from '../../src/models/solution'
import { initialize, IntervalTimestamp } from '../../src/analytics-consumer/models/utils'
import trialBehaviour, { Trial } from '../../src/analytics-consumer/models/trial'
import experienceBehaviour, { Experience } from '../../src/analytics-consumer/models/experience'
import { StaticAnalysis } from '../../src/models/staticAnalysis'

// SERVER
export const startDB = async () => {
  await connectDB()
}

// DB
export const dropDB = () => mongoose.connection.dropDatabase()
export const disconnectDB = () => mongoose.disconnect()
export const flushDB = () => mongoose.modelNames().forEach(model => mongoose.deleteModel(model))
export const deleteCollection = (collection: string) => mongoose.connection.dropCollection(collection)

// ENTITIES
const challengeId = "214" as any
const solutionId = "000ab5a8-d46d-4e18-a710-36a965ce9483" as any
const program = "PROGRAM"
const ast = [] as any
const turboModeOn = false
const staticAnalysis: StaticAnalysis = {
  "couldExecute": true,
  "allExpectResults": [],
  "score": {
    "expectResults": {},
    "percentage": 100
  },
  "error": ""
}

const online = true
const browserId = 1111111111
const userId = "0000000000"
const answers = [
  {
    "question": {
      "id": 4,
      "title": "Clase o tarea",
    },
    "response": {
      "isOnSchoolTime": "No",
      "isDoingHomework": "Sí, estoy haciendo la tarea ahora",
      "timestamp": "2021-05-17T15:02:11.903Z"
    }
  },
  {
    "question": {
      "id": 5,
      "title": "Escuela y compañía",
    },
    "response": {
      "isAtSchool": "Sí",
      "help": "Estoy con una compañera o compañero",
      "timestamp": "2021-05-17T15:02:44.686Z"
    }
  },
]
const experimentGroup = 'treatment'

export const newContext = (init?) => Object.assign({
  "id": "00017168-ab58-443e-a596-edbe2712215a",
  online, browserId, userId, answers, experimentGroup
}, init)
export const executionResult = (isTheProblemSolved: boolean) => ({
  program: isTheProblemSolved ? 'SUCCESS_PROGRAM' : 'FAIL_PROGRAM',
  executionResult: { isTheProblemSolved } as any
})

export const newSolution = (init?: Partial<Solution>) => initialize(Solution,
  {
    context: newContext(),
    challengeId,
    program,
    ast,
    solutionId,
    turboModeOn,
    staticAnalysis,
    timestamp: new Date(),
    ...init
  })
export const successSolution = newSolution(executionResult(true))
export const failSolution = newSolution(executionResult(false))
export const unknownSolution = newSolution()

export const newTrial = (...solutions: Solution[]): Trial => {
  const [baseTrial, ...trials] = solutions.map(s => trialBehaviour.buildTrial([s]))
  trials.forEach(t => trialBehaviour.addTrial(baseTrial, t))
  return baseTrial
}

export const newExperience = (...solutions: Solution[]): Experience => {
  const experience = experienceBehaviour.mergeExperiences(
    solutions.map(s => experienceBehaviour.buildExperience(s))
  )
  experienceBehaviour.solveTrialOverlaps(experience)
  return experience
}

export const after = (seconds: number) => new Date(new Date().getTime() + (seconds * 1000))
export const withoutMilis = (date: string) => date.slice(0, 19)

// EXPECTATIONS

export const expectIntervalTimestamp = (timestamp: IntervalTimestamp, expected: IntervalTimestamp) => {
  const { start, end, lapse } = timestamp
  expect(start.toISOString()).toMatch(withoutMilis(expected.start.toISOString()))
  expect(end.toISOString()).toMatch(withoutMilis(expected.end.toISOString()))
  expect(lapse).toBeGreaterThanOrEqual(expected.lapse)
  expect(lapse).toBeLessThanOrEqual(expected.lapse + 2)
}

export const expectJSON = (value: any, expected: any) =>
  expect(JSON.stringify(value)).toMatch(JSON.stringify(expected))