import { prop, getModelForClass, ReturnModelType, modelOptions, Severity } from '@typegoose/typegoose'
import * as crypto from 'crypto'

export const CODE_EXPIRATION_SECONDS = 900 // 15 minutos
export const MAX_VERIFICATION_ATTEMPTS = 5

export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 1000000).toString()
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class ForumVerificationCode {
  @prop({ required: true, index: true })
  email: string

  @prop({ required: true })
  userId: string

  @prop({ required: true })
  code: string

  @prop({ default: 0 })
  attempts: number

  @prop({ required: true, default: Date.now, expires: CODE_EXPIRATION_SECONDS })
  createdAt: Date

  static findLatestByEmail(this: ReturnModelType<typeof ForumVerificationCode>, email: string) {
    return this.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 })
  }

  static findValidCode(this: ReturnModelType<typeof ForumVerificationCode>, email: string, code: string) {
    return this.findOne({
      email: email.toLowerCase(),
      code: code.trim()
    })
  }
}

export const ForumVerificationCodeModel = getModelForClass<typeof ForumVerificationCode>(ForumVerificationCode)
