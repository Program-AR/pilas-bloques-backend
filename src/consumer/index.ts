/* eslint-disable @typescript-eslint/no-var-requires */

// ENV VAR
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

// GLOBALS
import fetch from 'node-fetch'
global.fetch = fetch as any

// MAIN
import yargs from "yargs"
import { allChallengeIds, decompositionChallengesIds } from './commands/utils'

yargs(process.argv.slice(2))
  .command(require('./commands/analyze'))
  .command(require('./commands/results'))
  .options({
    'challenges': {
      string: true,
      array: true,
      describe: 'Challenges ids to build experiences',
      choices: allChallengeIds,
      default: decompositionChallengesIds,
    },
    'collection': {
      string: true,
      describe: 'Collection where experiences will saved',
      default: 'experiences',
    },
    'limit': {
      number: true,
      describe: 'Limit for Solutions',
    },
    'ignoreUsers': {
      string: true,
      array: true,
      describe: 'Users ids to ignore',
      default: [],
    },
    'onlyLoggedIn': {
      boolean: true,
      describe: 'Use only info from logged users',
      default: false,
    },
  })
  .demandCommand()
  .strict()
  .help()
  .argv
