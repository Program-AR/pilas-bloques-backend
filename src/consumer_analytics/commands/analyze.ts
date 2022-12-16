import { runner } from './runner'
import analyzer from '../persistence/analyzer'
const { log, time, timeEnd } = console

exports.command = 'analyze'
exports.describe = 'Build experiences from solutions'
exports.handler = runner(async (opt) => {
  log(`Building experiences for challenge ${opt.challengeId}...`)
  time(`challenge ${opt.challengeId}`)
  await analyzer.experiences(opt)
  timeEnd(`challenge ${opt.challengeId}`)
})
