import { prop, getModelForClass, Severity, modelOptions, Ref } from '@typegoose/typegoose'
import { Schema } from 'mongoose'
import { Context } from './context'
import { StaticAnalysis } from './staticAnalysis'
import { User } from './user'

//This is duplicated in pilas react, remember to unificar when making the monorepo :)
const sceneTypes =  ["Lita", "Duba", "Toto", "Coty", "Manic", "Chuy", "Yvoty", "Capy", "Custom"] as const //Used for file validity checking
export type SceneType = typeof sceneTypes[number]

type Cell = string

export type SceneMap = Cell[][]

export type Scene = {
    type: SceneType
    maps: SceneMap[]
}

type Assesments =  {
    itWorks?: boolean, // old "debeFelicitar", default true
    decomposition?: DecompositionAssessment,
    simpleRepetition?: boolean,
    conditionalRepetition?: boolean,
    conditionalAlternative?: boolean,
}

type DecompositionAssessment = { maxProgramLength: number }

@modelOptions({ schemaOptions: { collection: 'creatorChallenges' }, options: { allowMixed: Severity.ALLOW } })
export class CreatorChallenge {
    @prop({ required: true })
    fileVersion: number
    @prop({ required: true })
    title: string
    @prop({ required: true })
    statement: {
        description: string,
        clue?: string
    }
    @prop({ required: true })
    scene: Scene
    @prop({ required: true })
    toolbox: {
        blocks: string[], // for now, block ids, future: could be objects.
        categorized?: boolean // default true
    }
    @prop()
    stepByStep: boolean
    @prop()
    predefinedSolution: string
    @prop()
    assesments: Assesments
    @prop({ ref: () => User })
    user: Ref<User>
}


export const CreatorChallengeModel = getModelForClass<typeof CreatorChallenge>(CreatorChallenge)