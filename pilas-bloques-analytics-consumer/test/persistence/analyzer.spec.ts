import describeDB from './describeDB'
import solutions = require('./1_solutions/solutions')
import analyzer, { reduce, ExperienceByChallenge, finalize } from '../../src/persistence/analyzer'
import { CompleteSolution as Solution } from 'pilas-bloques-models'
import { Experience } from '../../src/models/experience'
import { expectJSON, newExperience, deleteCollection } from '../utils'

describeDB('Analyzer', () => {
  let experiencesByChallenge: ExperienceByChallenge[]
  let basicExperience: Experience
  let splittedExperience: Experience

  beforeEach(async () => {
    const { results } = await analyzer.experiences()
    experiencesByChallenge = results
    basicExperience = experiencesByChallenge.find(e => e._id === "1-2c1-ok").value
    splittedExperience = experiencesByChallenge.find(e => e._id === "3-3c3-split").value
  })

  test('should group by challenge and user', () => {
    const sorted = exps => [...exps].sort((a, b) => a._id < b._id ? -1 : 1)
    expect(sorted(experiencesByChallenge)).toMatchObject(sorted([
      { _id: "1-2c1-1c2" }, { _id: "3-3c3-split" }, { _id: "1-2c1-ok" }, { _id: "2-2c1-1c2" }, { _id: "3-100" }]))
  })

  test('value result', () =>
    expect(basicExperience).toMatchObject(expectedExperiencies("1-2c1-ok"))
  )

  describe('options', () => {

    test('limit', async () => {
      const { results: [experience] } = await analyzer.experiences({ limit: 1 })
      expect(experience.value.executionCount).toBe(1)
    })

    test('collection', async () => {
      const collection = 'TEST'
      const response = await analyzer.experiences({ collection })
      expect(response).toHaveProperty('collection')
      const count = await analyzer.experiencesCount(collection)
      expect(count).toBeGreaterThan(0)
      await deleteCollection(collection) // No effect
    })

    test('challengeId', async () => {
      const { results } = await analyzer.experiences({ challengeId: '1' })
      expect(results).toHaveLength(2)
    })

    test('ignoreUsers', async () => {
      const { results } = await analyzer.experiences({ ignoreUsers: ['2c1-1c2', '3c3-split', 100] })
      expect(results).toHaveLength(1)
    })
  })

  describe('reduce function', () => {
    const userId = '2c1-1c2'
    let userSolutions: Solution[], experiences: Experience[]

    beforeEach(() => {
      userSolutions = solutions.filter(s => s.context.userId == userId)
      experiences = userSolutions.map(s => newExperience(s))
    })

    test('insensitivity to order', () =>
      expectReduction(experiences, experiences.reverse())
    )

    test('idempotence', () => {
      const [s1, s2, s3] = userSolutions
      expectReduction(experiences, [
        reduce(null, [newExperience(s1), newExperience(s3)]),
        newExperience(s2),
      ])
    })

    function expectReduction(experiences1: Experience[], experiences2: Experience[]) {
      expectJSON(reduce(null, experiences1), reduce(null, experiences2))
    }
  })

  describe('finalize function', () => {

    test.skip('split by timeout grouped by program trials', () =>
      // skipped because property 'trials' is now removed from experience.
      // I think what we could test here is the overlapping of trials, yet I think next test is already doing it
      expect(splittedExperience.trials).toHaveLength(3)
    )

    test('update trials collection based properties', () =>
      expect(splittedExperience.trialsCount).toBe(3)
    )

    test('does not affect linear experiences', () =>{
      basicExperience.trials = [basicExperience.lastTrial]
      expect(finalize(null, basicExperience)).toMatchObject(expectedExperiencies("1-2c1-ok"))
  })

  })

})

function expectedExperiencies(id) {
  return {
    "1-2c1-ok": {
      firstSuccess: {
        solution: {
          program: "SUCCESS_PROGRAM",
          timestamp: expect.any(Date),
        },
        executionCount: 1,
        trialsCount: 1,
      },
      lastSuccess: {
        solution: {
          program: "SUCCESS_PROGRAM",
          timestamp: expect.any(Date)
        },
        executionCount: 2,
        trialsCount: 1,
      },
      executionCount: 2,
      trialsCount: 1,
      lastTrial: {
        program: "SUCCESS_PROGRAM",
        executionCount: 2,
        result: "GOOD",
        timestamp: {
          start: expect.any(Date),
          end: expect.any(Date),
          lapse: expect.any(Number),
        }
      },
      session: {
        isOnSchoolTime: false,
        isDoingHomework: true,
        isAtSchool: true,
        help: 'classmate',
        count: 2,
      },
      timestamp: {
        start: expect.any(Date),
        end: expect.any(Date),
        lapse: expect.any(Number),
      }
    }
  }[id]
}