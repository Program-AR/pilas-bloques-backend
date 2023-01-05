import { connectDB } from '../persistence/connect'
import { challengesIds } from './utils'
import { ExperiencesOptions } from '../persistence/analyzer'
const { log, time, timeEnd } = console

const parseNumbers = (ids: any[]) => ids.map(id => isFinite(id) ? Number.parseInt(id) : id)

export const runner = (fn: (opt: ExperiencesOptions) => Promise<void>) => async function (argv) {
  argv.ignoreUsers = parseNumbers(argv.ignoreUsers)
  const { collection, challenges, ignoreUsers, limit, onlyLoggedIn } = argv
  function selectChallenges() {
    if (!challenges.length) {
      log(`No challenges selected -> using all challenges`)
      return challengesIds
    }
    else {
      log(`Using challenges: ${challenges}`)
      return challenges
    }
  }

  log('Connecting DB...')
  await connectDB()
  log(`Using collection`, collection)
  if (ignoreUsers.length) log(`Ignoring users`, ignoreUsers)
  if (onlyLoggedIn) log('Using only solutions from logged users')
  if (limit) log(`Limit`, limit)

  time('process')
  for (const challengeId of selectChallenges()) {
    await fn({ ...argv, challengeId })
  }
  timeEnd('process')

  log('Finish')
  process.exit(0)
}

