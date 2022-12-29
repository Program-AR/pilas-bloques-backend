import { prop, getModelForClass, Severity, modelOptions, Ref, ReturnModelType } from '@typegoose/typegoose'
import { Context } from './context'
import { CompleteSolution, BaseSolution } from './solution';

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Challenge {
  @prop({ required: true, index: true })
  challengeId: string
  @prop({ ref: () => BaseSolution })
  firstSolution?: Ref<BaseSolution>
  @prop({ required: true })
  timestamp: Date
  @prop()
  context: Context

  public static async setFirstSolution(this: ReturnModelType<typeof Challenge>, challengeId: any, contextId: any, solution: CompleteSolution) {
    const challenge = await this.findOne({ challengeId, 'context.id': contextId }).sort({ 'context.timestamp': -1 })
    if (challenge && !challenge.firstSolution) {
      challenge.firstSolution = solution
      return challenge.save()
    }
  }
}

export const ChallengeModel = getModelForClass<typeof Challenge>(Challenge)
