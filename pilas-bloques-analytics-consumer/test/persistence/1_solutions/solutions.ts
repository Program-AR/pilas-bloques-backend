import { newSolution, newContext, after, executionResult } from '../../utils'
import { CompleteSolution as Solution, Context } from 'pilas-bloques-models'

const context = (userId: string | number, init?: Partial<Context>) => ({ context: newContext({ userId, ...init }) })

const challenge = (challengeId: string) => ({ challengeId })

const data: Partial<Solution>[] = [
  {
    ...context('2c1-ok', {
      id: "1",
      answers: [{
        "response": {
          "isOnSchoolTime": "No",
          "isDoingHomework": "Sí, estoy haciendo la tarea ahora",
        }
      }] as any // TODO: Type Mixed
    }),
    ...challenge('1'),
    ...executionResult(true),
  },
  {
    ...context('2c1-ok', {
      id: "2",
      answers: [{
        "response": {
          "isAtSchool": "Sí",
          "help": "Estoy con una compañera o compañero",
        }
      }] as any // TODO: Type Mixed
    }),
    ...challenge('1'),
    ...executionResult(true),
    timestamp: after(1),
  },
  {
    ...context('2c1-1c2'),
    ...challenge('1')
  },
  {
    ...context('2c1-1c2'),
    ...challenge('1'),
    timestamp: after(1)
  },
  {
    ...context('2c1-1c2'),
    ...challenge('2'),
    timestamp: after(2)
  },
  {
    ...context('3c3-split'),
    ...challenge('3'),
    program: "A",
  },
  {
    ...context('3c3-split'),
    ...challenge('3'),
    program: "B",
    timestamp: after(1)
  },
  {
    ...context('3c3-split'),
    ...challenge('3'),
    program: "A",
    timestamp: after(2)
  },
  {
    ...context(100),
    ...challenge('3')
  },
]

export = data.map(newSolution)