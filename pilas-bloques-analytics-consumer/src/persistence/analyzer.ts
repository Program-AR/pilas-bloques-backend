import { mongoose } from '@typegoose/typegoose'
import { MapReduceResult } from 'mongoose'
import { CompleteSolution as Solution, CompleteSolutionModel } from 'pilas-bloques-models'
import e, { Experience } from '../models/experience'

const SolutionModel = mongoose.connection.model('SolutionModel', CompleteSolutionModel.schema, "solutions")

const experienceBehaviour = e

type Key = string
type Value = Experience
let emit: (key: Key, value: Value) => void
let ignoredUsers: any[]

const map = function (this: Solution) {
  const { context, challengeId } = this
  if (!ignoredUsers.includes(context.userId)) {
    emit(`${challengeId}-${context.userId}`, experienceBehaviour.buildExperience(this))
  }
}

export const reduce = function (_key: Key, values: any[]): Experience {
  const experiences: Experience[] = values // Bad inferred type of mapReduce functions
  return experienceBehaviour.mergeExperiences(experiences)
}

export const finalize = function (_key: Key, experience: Experience) {
  experienceBehaviour.solveTrialOverlaps(experience)
  delete experience.trials
  delete experience.session.ids
  return experience
}

export interface ExperiencesOptions {
  limit?: number
  collection?: string
  challengeId?: string
  ignoreUsers?: (string | number)[]
  onlyLoggedIn?: boolean
}
export type ExperienceByChallenge = MapReduceResult<Key, Value>

const experiences: (opt?: ExperiencesOptions) => Promise<{ results: ExperienceByChallenge[] }> = (opt = {}) => {
  const { limit, collection, challengeId, ignoreUsers, onlyLoggedIn } = opt
  const query = challengeId ? { challengeId } : {}
  if(onlyLoggedIn) query["context.userId"]=/.*[^\d]+.*/i // if has something that is not a number, it is an OID
  return SolutionModel
    .mapReduce<Key, Value>({
      map,
      reduce,
      finalize,
      query,
      limit,
      scope: { experienceBehaviour, ignoredUsers: ignoreUsers || [] },
      out: collection && { merge: collection },
      jsMode: true, // ?
      verbose: true, // ?
    })
}

const solutionsCount = (): Promise<number> => SolutionModel.countDocuments({}).exec()

const experiencesCount = (collection: string, challengeId?: string): Promise<number> => mongoose.connection.collection(collection).countDocuments(challengeId ? { 'value.challengeId': challengeId } : {})

export default { experiences, solutionsCount, experiencesCount }