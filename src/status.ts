import * as express from 'express'

const makeStatusRouter = (app: string) => {
    const router = express.Router()
    router.all('/ping', (_, res) => res.send('pong. <br/> ¡Now send <a href="status">/status!</a>'))
    router.all('/status', (_, res) => res.send({ 
        app,
        version: process.env.npm_package_version,
        alive: true,
        message: `I'M ALIVE!! MUAHAHAH!!! AHAHA!!! HAHCOF COFFCOFCOF!!... ARGH... Sorry. Got excited.`
    }))
    return router
}

export default app => makeStatusRouter(app)