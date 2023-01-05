import sessionBehaviour, { Session } from '../../src/consumer/models/session'
import { newContext, newSolution, unknownSolution as solution } from './utils'
import { CompleteSolution } from '../../src/models/solution'

describe('Session', () => {
  const basicSession = sessionBehaviour.buildSession(solution)

  test('experiment group from solution', () => {
    const experimentSolution: CompleteSolution = {...solution, context: {...solution.context, experimentGroup: 'control'}}
    const experimentSession = sessionBehaviour.buildSession(experimentSolution)
    expect(experimentSession.experimentGroup).toBe(experimentSolution.context.experimentGroup)
  })

  describe('answers', () => {

    test('no answers', () =>
      expect(sessionFromAnswers()).toMatchObject({
        count: 1
      })
    )

    test('one answers', () =>
      expect(basicSession).toMatchObject({
        isOnSchoolTime: false,
        isDoingHomework: true,
        isAtSchool: true,
        help: 'classmate'
      })
    )

    test('many answers', () =>
      expect(sessionBehaviour.mergeSessions([
        sessionFromAnswers({
          "isOnSchoolTime": "No",
          "isDoingHomework": "No",
        }),
        sessionFromAnswers({
          "isAtSchool": "Sí",
          "help": "Estoy con una adulta o adulto",
        })
      ])).toMatchObject({
        isOnSchoolTime: false,
        isDoingHomework: false,
        isAtSchool: true,
        help: 'adult'
      })
    )
  })

  describe('session count', () => {
    test('unique session', () =>
      expectFinalSessionCount(basicSession).toBe(1)
    )
    test('same session', () =>
      expectFinalSessionCount(basicSession, basicSession).toBe(1)
    )
    test('differente sessions', () =>
      expectFinalSessionCount(basicSession, { ...basicSession, ids: ['OTHER'] }).toBe(2)
    )
  })

})

const expectFinalSessionCount = (...sessions: Session[]) => {
  const finalSession = sessionBehaviour.mergeSessions(sessions)
  return expect(finalSession.count)
}

const sessionFromAnswers = (...answers: any[]) =>
  sessionBehaviour.buildSession(newSolution({ context: newContext({ answers: answers.map(response => ({ response })) }) }))