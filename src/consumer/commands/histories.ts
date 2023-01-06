import { connectDB } from '../persistence/connect'
import historiesBuilder from '../persistence/historiesBuilder'

const { log, time, timeEnd } = console

exports.command = 'histories'
exports.describe = 'Build user histories from experiences'
exports.handler =   async function (argv) {
  time(`Building histories`)
  const { historiesCollection } = argv
  log('Connecting DB...')
  await connectDB()
  log(`Saving histories in collection "${historiesCollection}"`)
  await historiesBuilder.histories(argv)
  timeEnd(`Building histories`)
  log('Finish')
  process.exit(0)
}
