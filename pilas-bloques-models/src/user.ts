import { prop, getModelForClass, ReturnModelType, Severity, modelOptions } from '@typegoose/typegoose'
import { Base } from '@typegoose/typegoose/lib/defaultClasses'
import { Schema } from 'mongoose'
import { ExperimentGroup } from './context'

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Answer {
  @prop()
  question: Schema.Types.Mixed & { id: any }
  @prop()
  response: Schema.Types.Mixed
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class User extends Base<string> {
  @prop({ required: true, index: true, unique: true })
  username: string
  @prop({ required: true })
  salt: string
  @prop({ required: true })
  hashedPassword: string
  @prop({ required: true })
  parentName: string
  @prop({ required: true })
  parentDNI: string
  @prop()
  email?: string
  @prop({ _id: false, type: Answer })
  answers: Answer[]
  @prop()
  experimentGroup: ExperimentGroup

  @prop({ _id: false })
  profile: {
    nickName: string
    avatarURL: string
  }

  get answeredQuestionIds() { return this.answers.map(({ question }) => question.id) }

  /**
   * 
   * @param username is the non-standarized username (could have UpperCase letters)
   * @returns the user from the DB
   */
  static findByUsername(this: ReturnModelType<typeof User>, username: string) {
    return this.findOne({ 'username': this.standarizeUsername(username) })
  }

  static standarizeUsername(this: ReturnModelType<typeof User>, username: string) {
    return username.toLowerCase()
  }
}

export const UserModel = getModelForClass<typeof User>(User)