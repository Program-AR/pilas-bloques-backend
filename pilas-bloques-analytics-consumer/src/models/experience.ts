import { CompleteSolution as Solution } from "pilas-bloques-models"
import t, { Trial } from "./trial"
import u, { IntervalTimestamp } from './utils'
import s, { Session } from './session'

const utils = u
const trialBehaviour = t
const sessionBehaviour = s

interface Success {
  solution: Solution
  executionCount: number
  trialsCount: number
}
export interface Experience {
  trials: Trial[]
  userId: string,
  challengeId: string,
  executionCount: number
  trialsCount: number
  firstSuccess: Success
  lastSuccess: Success
  lastTrial: Trial
  session: Session
  timestamp: IntervalTimestamp
}

function buildExperience(this: ExperienceBehaviour, solution: Solution): Experience {
  const trial = this.trialBehaviour.buildTrial([solution])
  const firstSuccessSolution = this.trialBehaviour.isSolved(solution) && solution
  const lastSuccessSolution = this.trialBehaviour.isSolved(solution) && solution
  return {
    trials: [trial],
    userId: solution.context.userId as any,
    challengeId: solution.challengeId as any,
    executionCount: 1,
    trialsCount: 1,
    firstSuccess: firstSuccessSolution && this.utils.buildSuccess(firstSuccessSolution, 1, 1),
    lastSuccess: lastSuccessSolution && this.utils.buildSuccess(lastSuccessSolution, 1, 1),
    lastTrial: trial,
    session: this.sessionBehaviour.buildSession(solution),
    timestamp: trial.timestamp,
  }
}

function mergeExperiences(this: ExperienceBehaviour, experiences: Experience[]): Experience {
  const { userId, challengeId } = experiences[0]
  let trials = []
  let firstSuccessSolution: Solution, lastSuccessSolution: Solution, start: Date, end: Date
  let executionCount = 0
  for (const experience of experiences) {
    executionCount += experience.executionCount
    if (!start || experience.timestamp.start < start) start = experience.timestamp.start
    if (!end || experience.timestamp.end > end) end = experience.timestamp.end
    if (experience.firstSuccess && (!firstSuccessSolution || experience.firstSuccess.solution.timestamp < firstSuccessSolution.timestamp)) firstSuccessSolution = experience.firstSuccess.solution
    if (experience.lastSuccess && (!lastSuccessSolution || experience.lastSuccess.solution.timestamp > lastSuccessSolution.timestamp)) lastSuccessSolution = experience.lastSuccess.solution
    trials = experience.trials.reduce((a, t) => this.trialBehaviour.mergeNewTrial(a, t), trials)
  }
  trials.sort((t1, t2) => t1.timestamp.start.getTime() - t2.timestamp.start.getTime()) 
  return {
    trials,
    userId,
    challengeId,
    executionCount,
    firstSuccess: firstSuccessSolution && this.makeSuccessFromTrials(firstSuccessSolution, trials),
    lastSuccess: lastSuccessSolution && this.makeSuccessFromTrials(lastSuccessSolution, trials),
    trialsCount: trials.length,
    lastTrial: trials[trials.length - 1],
    session: this.sessionBehaviour.mergeSessions(experiences.map(e => e.session)),
    timestamp: this.utils.buildIntervalTimestamp(start, end)
  }
}

function makeSuccessFromTrials(this: ExperienceBehaviour, solution: Solution, trials: Trial[]) {
  let executionCount = 0, trialsCount = 0
  for (const trial of trials) {
    const { start, end } = trial.timestamp
    if (end <= solution.timestamp) {
      executionCount += trial.executionCount
      trialsCount += 1
    } else if (this.utils.betweenInclusive(solution.timestamp, start, end)) {
      executionCount += trial.solutions.filter(s => s.timestamp <= solution.timestamp).length
      trialsCount += 1
    }
  }
  return this.utils.buildSuccess(solution, executionCount, trialsCount)
}

function solveTrialOverlaps(this: ExperienceBehaviour, experience: Experience) {
  this.trialBehaviour.solveOverlaps(experience.trials)
  experience.trialsCount = experience.trials.length
}

type ExperienceBehaviour = typeof experienceBehaviour
const experienceBehaviour = {
  buildExperience,
  mergeExperiences,
  makeSuccessFromTrials,
  solveTrialOverlaps,
  utils,
  trialBehaviour,
  sessionBehaviour,
}
export default experienceBehaviour