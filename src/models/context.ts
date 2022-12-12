
import { prop, getModelForClass, Severity, modelOptions } from '@typegoose/typegoose'
import { Answer } from './user'

export type ExperimentGroup = 'treatment' | 'control' | 'notAffected'
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Context {
  @prop({ required: true })
  online: boolean
  @prop({ required: true })
  browserId: string
  @prop({ required: true })
  id: string
  @prop({ required: true })
  userId: string
  @prop()
  answers: Answer[]
  @prop()
  experimentGroup: ExperimentGroup
  @prop()
  url: string
  @prop()
  ip: string
  @prop()
  version: string
  @prop()
  locale: string
  @prop()
  usesNightTheme: boolean
  @prop()
  usesSimpleRead: boolean
  @prop()
  usesFullScreen: boolean
  @prop()
  solvedChallenges: string[]
}

export const ContextModel = getModelForClass<typeof Context>(Context)