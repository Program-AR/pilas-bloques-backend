import { newSolution, executionResult, newExperience, after, expectIntervalTimestamp } from './utils'

describe('Experience', () => {

  test('session', () =>
    expect(anExperience.session).toMatchObject({
      isOnSchoolTime: false,
      isDoingHomework: true,
      isAtSchool: true,
      help: 'classmate',
      count: 1,
    })
  )
  test('times executed', () =>
    expect(anExperience.executionCount).toBe(4)
  )
  test('number of trials', () =>
    expect(anExperience.trialsCount).toBe(2)
  )

  test('first success', () =>
    expect(anExperience.firstSuccess).toMatchObject({
      solution: solutions[1],
      executionCount: 2,
      trialsCount: 1
    })
  )
  test('last success', () =>
    expect(anExperience.lastSuccess).toMatchObject({
      solution: solutions[3],
      executionCount: 4,
      trialsCount: 2
    })
  )

  test('last trial static analysis', () => 
    expect(anExperience.lastTrial.staticAnalysis).toMatchObject(staticAnalysis2)
  )

  test('timestamp', () =>
    expectIntervalTimestamp(anExperience.timestamp, {
      start: solutions[0].timestamp,
      end: solutions[3].timestamp,
      lapse: 2999
    })
  )

  describe('should group by program', () => {

    test('same program', () =>
      expect(newExperience(
        newSolution(), newSolution({ timestamp: after(1) }), newSolution({ timestamp: after(2) })
      ).trialsCount).toBe(1)
    )

    test('different programs', () =>
      expect(anExperience.trialsCount).toBe(2)
    )

    test('ordering by timestamps', () => {
      const overlapedTrialsExperience = newExperience(
        newSolution({ program: a }),
        newSolution({ program: b, timestamp: after(1) }),
        newSolution({ program: a, timestamp: after(2) }),
      )
      expect(overlapedTrialsExperience.trialsCount).toBe(3)
    })

  })

})

const a = 'PROGRAM A'
const b = 'PROGRAM B'

export const staticAnalysis1 = staticAnalysis(false, 67)
const staticAnalysis2 = staticAnalysis(true, 100)

function staticAnalysis(usesConditionalRepetition: boolean, percentage: number) {
  return {
    couldExecute: true,
    allExpectResults: [
      {
        id: 'decomposition',
        result: true
      },
      {
        id: 'uses_conditional_repetition',
        result: usesConditionalRepetition
      }
    ],
    score: {
      expectResults: {
        solution_works: true,
        decomposition: true,
        uses_conditional_repetition: usesConditionalRepetition
      },
      percentage
    },
    error: ""
  }
}

const solutions = [
  newSolution({ ...executionResult(false), program: a }),
  newSolution({ ...executionResult(true), program: a, timestamp: after(1), staticAnalysis: staticAnalysis1 }),
  newSolution({ ...executionResult(false), program: a, timestamp: after(2) }),
  newSolution({ ...executionResult(true), program: b, timestamp: after(3), staticAnalysis: staticAnalysis2 })
]

const anExperience = newExperience(...solutions)