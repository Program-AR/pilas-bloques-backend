import { StaticAnalysis } from '../../src/models/staticAnalysis'
import trialBehaviour, { Trial } from '../../src/consumer/models/trial'
import { newTrial, successSolution, failSolution, unknownSolution, newSolution, after, expectIntervalTimestamp } from './utils'
import { staticAnalysis1 } from './experience.spec'

describe('Trial', () => {

  test('executionCount', () =>
    expect(newTrial(successSolution, failSolution, unknownSolution).executionCount).toBe(3)
  )

  test('timestamp', () =>
    expectIntervalTimestamp(newTrial(
      newSolution({ timestamp: after(1) }),
      newSolution({ timestamp: after(2) })
    ).timestamp, {
      start: after(1),
      end: after(2),
      lapse: 1000
    })
  )

  test('base trial', () => {
    const staticAnalysis: StaticAnalysis = staticAnalysis1

    const solutionWithStaticAnalysis = {...successSolution, staticAnalysis}

    const baseTrial: Trial = {
      solutions: [{
        timestamp: solutionWithStaticAnalysis.timestamp,
        executionResult: solutionWithStaticAnalysis.executionResult
      }],
      program: solutionWithStaticAnalysis.program,
      ast: solutionWithStaticAnalysis.ast,
      executionCount: 1,
      result: "GOOD",
      timestamp: {
        start: solutionWithStaticAnalysis.timestamp,
        end: solutionWithStaticAnalysis.timestamp,
        lapse: 0
      },
      staticAnalysis
    }

    expect(trialBehaviour.buildTrial([solutionWithStaticAnalysis])).toStrictEqual(baseTrial)
  })

  describe('result', () => {

    test('result GOOD (always success)', () =>
      expect(newTrial(successSolution, successSolution).result).toBe('GOOD')
    )

    test('result BAD (always fail)', () =>
      expect(newTrial(failSolution, failSolution).result).toBe('BAD')
    )

    test('result FLAKY (success - fail)', () =>
      expect(newTrial(successSolution, failSolution).result).toBe('FLAKY')
    )

    test('result FLAKY (success - fail - unknown)', () =>
      expect(newTrial(successSolution, failSolution, unknownSolution).result).toBe('FLAKY')
    )

    test('result FLAKY (success - unknown)', () =>
      expect(newTrial(successSolution, unknownSolution).result).toBe('FLAKY')
    )

    test('result BAD (fail - unknown)', () =>
      expect(newTrial(failSolution, unknownSolution).result).toBe('BAD')
    )

    test('result BAD (fail - unknown)', () =>
      expect(newTrial(failSolution, unknownSolution).result).toBe('BAD')
    )

    test('result BAD (unknown - unknown)', () =>
      expect(newTrial(failSolution, unknownSolution).result).toBe('BAD')
    )
  })


  describe('solve overlaps', () => {

    test('overlap at the beginning', () => {
      const trials = createTrialsAndSolveOverlaps([1, 3], [1, 2])
      console.log(trials)
      expect(trials.length).toBe(2)
    })

    test('overlap in the middle', () => {
      const trials = createTrialsAndSolveOverlaps([1, 5], [2, 4])
      expect(trials.length).toBe(3)
    })

    test('overlap at the end', () => {
      const trials = createTrialsAndSolveOverlaps([1, 2], [2, 3])
      expect(trials.length).toBe(2)
    })

    test('not overlap', () => {
      const trials = createTrialsAndSolveOverlaps([1, 2], [3, 4])
      expect(trials.length).toBe(2)
    })

    test('multi overlap', () => {
      const trials = createTrialsAndSolveOverlaps([1, 3], [2, 4])
      expect(trials.length).toBe(4)
    })

  })
})

const trialWithInterval = (start: number, end: number, program: string) => newTrial(
  newSolution({ timestamp: after(start), program }),
  newSolution({ timestamp: after(end), program })
)

const createTrialsAndSolveOverlaps = (...times: number[][]) => {
  const trials = times.map(([start, end], i) => trialWithInterval(start, end, `PROGRAM ${i}`))
  trialBehaviour.solveOverlaps(trials)
  return trials
}