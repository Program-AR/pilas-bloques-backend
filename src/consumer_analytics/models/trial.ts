import { CompleteSolution as Solution } from '../../models/solution'
import { StaticAnalysis } from '../../models/staticAnalysis'
import u, { IntervalTimestamp, ThinSolution } from './utils'
const utils = u

export interface Trial {
  solutions: ThinSolution[]
  ast: any[]
  program: string
  executionCount: number
  result: "GOOD" | "FLAKY" | "BAD"
  timestamp: IntervalTimestamp
  staticAnalysis: StaticAnalysis
}

type ProtoSolution = Pick<Solution, 'program' | 'ast' | 'timestamp' | 'executionResult' | 'staticAnalysis'>

function result(this: TrialBehaviour, solutions: ProtoSolution[]) {
  const everyGood = solutions.every(this.isSolved)
  const anyGood = solutions.some(this.isSolved)
  return everyGood ? 'GOOD' : anyGood ? 'FLAKY' : 'BAD'
}

export const isSolved = (solution: ProtoSolution): boolean => solution.executionResult && !!solution.executionResult['isTheProblemSolved']

function buildTrial(this: TrialBehaviour, solutions: ProtoSolution[]): Trial {
  const [{ program, ast, staticAnalysis }] = solutions
  const executionCount = solutions.length
  const thinSolutions = solutions.map(({ timestamp, executionResult }) => ({ timestamp, executionResult }))
  const result = this.result(solutions)
  const timestamp = this.utils.buildIntervalTimestampFor(thinSolutions.map(t => t.timestamp))
  return { solutions: thinSolutions, program, ast, executionCount, result, timestamp, staticAnalysis }
}

function mergeNewTrial(this: TrialBehaviour, trials: Trial[], newTrial: Trial) {
  const selectedTrial = trials.find(t => t.program == newTrial.program)
  if (selectedTrial) {
    this.addTrial(selectedTrial, newTrial)
  } else {
    trials.push(newTrial)
  }
  return trials
}

function addTrial(this: TrialBehaviour, selectedTrial: Trial, newTrial: Trial) {
  const executionCount = selectedTrial.executionCount + newTrial.executionCount
  let result
  switch (selectedTrial.result) {
    case 'GOOD':
      result = newTrial.result == 'GOOD' ? 'GOOD' : 'FLAKY'
      break
    case 'BAD':
      result = newTrial.result == 'BAD' ? 'BAD' : 'FLAKY'
      break
    default:
      result = 'FLAKY'
      break
  }
  const solutions = selectedTrial.solutions.concat(newTrial.solutions)
  solutions.sort((s1, s2) => s1.timestamp.getTime() - s2.timestamp.getTime())
  const timestamp = this.utils.buildIntervalTimestamp(
    this.utils.min(selectedTrial.timestamp.start, newTrial.timestamp.start),
    this.utils.max(selectedTrial.timestamp.end, newTrial.timestamp.end)
  )

  Object.assign(selectedTrial, { executionCount, result, solutions, timestamp })
}

function splitTrials(this: TrialBehaviour, longTrial: Trial, innerTrial: Trial) {
  const lastSolutions = longTrial.solutions
  const firstSolutions: ThinSolution[] = []
  // Move from last to start, stopping by inner trial start
  while (lastSolutions[0].timestamp < innerTrial.timestamp.start) {
    firstSolutions.push(lastSolutions.shift())
  }
  const makeProtoSolutions = (solutions: ThinSolution[], { ast, program, staticAnalysis }: Trial): ProtoSolution[] =>
    solutions.map(({ timestamp, executionResult }) => ({ timestamp, executionResult, ast, program, staticAnalysis }))

  return [
    this.buildTrial(makeProtoSolutions(firstSolutions, longTrial)),
    innerTrial,
    this.buildTrial(makeProtoSolutions(lastSolutions, longTrial)),
  ]
}

// TODO: Test?
function solveOverlaps(this: TrialBehaviour, trials: Trial[]): void {
  const everlap = ({ start: start1, end: end1 }: IntervalTimestamp, { start: start2 }: IntervalTimestamp) =>
    this.utils.betweenExclusive(start2, start1, end1)

  const splitTrialAt = (baseTrialIndex: number) => {
    const current = trials[baseTrialIndex]
    const next = trials[baseTrialIndex + 1]
    const newTrials = this.splitTrials(current, next)
    trials.splice.apply(trials, [baseTrialIndex, 2].concat(newTrials as any))
  }
  let i = 0
  while (trials[i + 1]) {
    // Trials are ordered by start timestamp
    if (everlap(trials[i].timestamp, trials[i + 1].timestamp)) {
      splitTrialAt(i)
    }
    i++
  }
}

type TrialBehaviour = typeof trialBehaviour
const trialBehaviour = { buildTrial, mergeNewTrial, addTrial, splitTrials, solveOverlaps, isSolved, result, utils, }
export default trialBehaviour