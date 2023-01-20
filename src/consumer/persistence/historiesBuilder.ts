import { mongoose } from '@typegoose/typegoose'
import { ExperienceModel } from '../models/experience'
import { UserHistory } from '../models/userHistory'

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
            'serverTimestamp': { '$toDate': '$value.lastSuccess.solution._id' },
            'program': '$value.lastSuccess.solution.program', 
            'score': '$value.lastSuccess.solution.staticAnalysis.score', 
            'phase': { '$cond' : [{ '$eq': ['$value.lastSuccess.solution.context.experimentGroup', 'treatment'] }, 'intervention', 'test'] },
            'ip': '$value.lastSuccess.solution.context.ip',
            'solvedChallenges': '$value.lastSuccess.solution.context.solvedChallenges',
            'context': '$value.lastSuccess.solution.context'
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

const pipeline = ({ limit, historiesCollection }) => {
  const pipe = baseUserHistoryAggregation
  if(limit) pipe.push({ '$limit': limit })
  if(historiesCollection) pipe.push({ '$out': historiesCollection  })
  return pipe
}

const histories: (opt: { collection: string, historiesCollection: string, limit: number }) => Promise<UserHistory[]> = async (opt) => {
    const ExperienceMongooseModel = mongoose.connection.model('ExperienceModel', ExperienceModel.schema, opt.collection)
    const hs = await ExperienceMongooseModel.aggregate<UserHistory>(pipeline(opt))
        .allowDiskUse(true) // Otherwise blows up for size of $group step
        .exec()
    console.log(hs)
    return hs
}

export default { histories }