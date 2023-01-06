import { mongoose } from '@typegoose/typegoose'
import { ExperienceModel } from '../models/experience'
import { UserHistory } from '../models/userHistory'
import { ExperiencesOptions } from './analyzer'

const baseUserHistoryAggregation: any[] = [
    {
      '$match': {
        'value.lastSuccess': {
          '$ne': undefined
        }, 
        'value.lastSuccess.solution.context.experimentGroup': {
          '$ne': 'notAffected'
        }
      }
    }, {
      '$match': {
        'value.lastSuccess.solution.context.experimentGroup': {
          '$ne': undefined
        }
      }
    }, {
      '$sort': {
        'value.lastSuccess.solution._id': 1
      }
    }, {
      '$group': {
        '_id': {
          'userId': '$value.userId'
        }, 
        'solvedChallenges': {
          '$push': {
            'challengeId': '$value.challengeId', 
            'solutionId': '$value.lastSuccess.solution._id', 
            'program': '$value.lastSuccess.solution.program', 
            'score': '$value.lastSuccess.solution.staticAnalysis.score', 
            'experimentGroup': '$value.lastSuccess.solution.context.experimentGroup'
          }
        }, 
        'group': {
          '$accumulator': {
            'init': 'function() {\n          return "control"\n        }', 
            'accumulate': 'function(state, experimentGroup) {\n          return (state === "experimental" || state === "control" && experimentGroup === "treatment") ? \n            "experimental" : "control"\n        }', 
            'accumulateArgs': [
              '$value.lastSuccess.solution.context.experimentGroup'
            ], 
            'merge': 'function(state1, state2) {\n          return (state1 === "experimental" || state2 === "experimental") ? \n            "experimental" : "control"\n        }', 
            'finalize': 'function(state) {               \n          return state\n        }', 
            'lang': 'js'
          }
        }
      }
    }, {
      '$project': {
        'userId': '$_id.userId', 
        '_id': false, 
        'solvedChallenges': true, 
        'group': true
      }
    }
  ]

const histories: (opt: { collection: string, historiesCollection: string, limit: number }) => Promise<UserHistory[]> = async (opt) => {
    const ExperienceMongooseModel = mongoose.connection.model('ExperienceModel', ExperienceModel.schema, opt.collection)
    console.log("TODO: Save histories in collection. For now will show them (please use limit)")
    const hs = await ExperienceMongooseModel.aggregate<UserHistory>(baseUserHistoryAggregation.concat([{'$limit': opt.limit}]))
        .allowDiskUse(true) // Otherwise blows up for size of $group step
        .exec()
    console.log(hs)
    return hs
}

export default { histories }