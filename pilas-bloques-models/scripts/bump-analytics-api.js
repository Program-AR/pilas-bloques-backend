const version = require("../package.json").version

const analyticsPath = "../../pilas-bloques-analytics/package.json"
const apiPath = "../../pilas-bloques-api/package.json"

const analytics = require(analyticsPath)

const api = require(apiPath)

analytics.dependencies['pilas-bloques-models'] = "adsfasdf"
api.dependencies['pilas-bloques-models'] = `^${version}`

console.log(analytics)

const fs = require('fs')

fs.writeFileSync(analyticsPath, JSON.stringify(analytics))