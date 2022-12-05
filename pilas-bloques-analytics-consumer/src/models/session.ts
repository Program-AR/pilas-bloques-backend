import { CompleteSolution as Solution, Context } from 'pilas-bloques-models'
import { ExperimentGroup } from 'pilas-bloques-models/dist/src/context'

export interface Session {
  isOnSchoolTime?: boolean
  isDoingHomework?: boolean
  isAtSchool?: boolean
  help?: 'adult' | 'classmate' | 'none'
  count: number
  ids: string[]
  experimentGroup: ExperimentGroup
}

function buildSession(this: SessionBehaviour, { context }: Solution): Session {
  const session = this.response(context) as Session
  session.ids = [context.id]
  session.count = 1
  session.experimentGroup = context.experimentGroup
  return session
}

function mergeSessions(this: SessionBehaviour, sessions: Session[]): Session {
  const ids = new Set(sessions.reduce((res, session) => res.concat(session.ids), []))
  const merge = (res, session) => Object.assign(res, session)
  const session = sessions.reduce(merge, {}) as Session
  session.ids = Array.from(ids)
  session.count = ids.size
  return session
}

function response(this: SessionBehaviour, context: Context): Partial<Session> {
  if (!context.answers.length) return {}
  const answersToSession = (res, ans) => Object.assign(res, this.responseConverter(ans['response']))
  return context.answers.reduce(answersToSession, {})
}

function responseConverter(this: SessionBehaviour, response: any): Partial<Session> {
  const session = {}
  for (const key in response) {
    session[key] = this.normalize(key, response[key])
  }
  return session
}

// https://github.com/Program-AR/pilas-bloques/blob/develop/app/components/personal-survey.js
function normalize(this: SessionBehaviour, key: string, value: string) {
  const booleanValue = (v: string) => v.startsWith('Sí')
  const helpValue = (v: string) => v.includes('adult') ? 'adult' : v.includes('compañer') ? 'classmate' : 'none'
  const defaultValue = (v: string) => v
  const answersParser = {
    'isOnSchoolTime': booleanValue,
    'isDoingHomework': booleanValue,
    'isAtSchool': booleanValue,
    'help': helpValue,
  }
  return (answersParser[key] || defaultValue)(value)
}


type SessionBehaviour = typeof sessionBehaviour
const sessionBehaviour = {
  buildSession,
  mergeSessions,
  response,
  responseConverter,
  normalize,
}
export default sessionBehaviour