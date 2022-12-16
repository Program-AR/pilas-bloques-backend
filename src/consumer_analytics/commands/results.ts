import { runner } from './runner'
import analyzer from '../persistence/analyzer'
const { log } = console

exports.command = 'results'
exports.describe = 'Show some results data'
exports.handler = runner(async ({ challengeId, collection }) => {
  const count = await analyzer.experiencesCount(collection, challengeId)
  log(`${count} experiences ${challengeId ? `for challenge ${challengeId} exist` : `exist now in ${collection}!`}`)
})

