const fs = require('fs')

const version = require("../package.json").version

const analyticsPath = "../../pilas-bloques-analytics/package.json"
const apiPath = "../../pilas-bloques-api/package.json"

const analytics = require(analyticsPath)

const api = require(apiPath)

function bumpModels(project, path){
    project.dependencies['pilas-bloques-models'] = `^${version}`
    fs.writeFileSync(path, JSON.stringify(project, null, 2))
}

bumpModels(analytics, analyticsPath)
bumpModels(api, apiPath)