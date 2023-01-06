import { ExperimentGroup } from "../../models/context"
import { Score } from "../../models/staticAnalysis"

export interface UserHistory {
    userId: string
    group: 'experimental' | 'control'
    solvedChallenges: SolvedChallenge[]
}

export interface SolvedChallenge {
    challengeId: string
    solutionId: string
    program: string
    link: string
    score: Score
    experimentGroup: ExperimentGroup
}