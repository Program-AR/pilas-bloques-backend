const fs = require('fs')

const version = require("../package.json").version

function bumpModels(projectName){
    const path = `../pilas-bloques-${projectName}/package.json`
    const project = require(`../${path}`)
    project.dependencies['pilas-bloques-models'] = `^${version}`
    fs.writeFileSync(path, JSON.stringify(project, null, 2))
}

bumpModels("analytics")
bumpModels("api")