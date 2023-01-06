import { prop, Severity, modelOptions } from '@typegoose/typegoose'

type ExpectResult = Record<string, string | boolean >

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Score {
    @prop()
    expectResults: Record<string, boolean>
    @prop()
    percentage: number
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class StaticAnalysis {
    @prop({ required: true })
    couldExecute: boolean
    @prop()
    allExpectResults: ExpectResult[]
    @prop()
    score: Score
    @prop()
    error: string
    
}