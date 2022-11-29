import { prop, getModelForClass, Severity, modelOptions, Ref } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { Context } from './context'
import { StaticAnalysis } from './staticAnalysis'
import { User } from './user'

@modelOptions({ schemaOptions: { collection: 'solutions' }, options: { allowMixed: Severity.ALLOW } })
export class BaseSolution {
  @prop({ required: true, index: true })
  challengeId: string
  @prop({ required: true, index: true })
  solutionId: string
  @prop({ required: true })
  program: string
  @prop({ required: true })
  staticAnalysis: StaticAnalysis
  @prop()
  executionResult: {
    isTheProblemSolved: boolean,
    stoppedByUser: boolean,
    error: {
      name: 'ActividadError' | string,
      message: string,
      stack?: string,
      nombreAnimacion?: string
    },
  }
  @prop({ ref: () => User })
  user: Ref<User> // TODO: Technically analytics solutions don't have users. https://github.com/Program-AR/pilas-bloques-models/pull/2/files#r674975271
}

@modelOptions({ schemaOptions: { collection: 'solutions' }, options: { allowMixed: Severity.ALLOW } })
export class CompleteSolution extends BaseSolution {
  @prop({ required: true })
  ast: Schema.Types.Mixed[]
  @prop({ required: true })
  turboModeOn: boolean
  @prop({ required: true })
  timestamp: Date
  @prop()
  context: Context
}

export const BaseSolutionModel = getModelForClass<typeof BaseSolution>(BaseSolution)
export const CompleteSolutionModel = getModelForClass<typeof CompleteSolution>(CompleteSolution)
