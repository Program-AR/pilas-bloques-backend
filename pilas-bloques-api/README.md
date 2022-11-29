¡Hola! :vulcan_salute: Este es un proyecto relacionado a [Pilas Bloques](https://pilasbloques.program.ar) :heart:. En el repositorio de ese proyecto encontrarás las guías sobre [cómo contribuir](https://github.com/Program-AR/pilas-bloques/blob/develop/CONTRIBUTING.md) y el [código de conducta](https://github.com/Program-AR/pilas-bloques/blob/develop/CODE_OF_CONDUCT.md), que son guías que aplican también a este proyecto.

Hi! :vulcan_salute: This is a project related to [Pilas Bloques](https://pilasbloques.program.ar) :heart:. In that project's repository you'll find the [contribution guidelines](https://github.com/Program-AR/pilas-bloques/blob/develop/CONTRIBUTING_en.md) and the [code of conduct](https://github.com/Program-AR/pilas-bloques/blob/develop/CODE_OF_CONDUCT_en.md) which also apply to this project.

# Pilas Bloques API
REST-API for Pilas Bloques app.

## Requisites
- [Nodejs](https://nodejs.org/es/) (v12 >=)
- [MonngoDB](https://www.mongodb.com/). This can be done by running a docker image:

Docker run example:
```
docker run -d --rm -p 27017:27017 -v $HOME/mongoData:/data/db --name mongoPilasBloques mongo:5.0.5
```

## Config project
- Checkout this repository.
- Create `.env` file with the required enviroments variables. You can copy from [`sample.env`](sample.env)
- Run `npm install`

## Running app
> Remember start the DB before!

For development
- Run `npm run dev` for server starts. Any file change should re-run the it.

For production
- Run `npm run build` for make `dist` directory. (TODO)
- Run `npm start` for server starts.

## Running tests

All tests
- Run `npm test`

Only one file
- Run `npm test -- -f <FILE_PATH>`

## Releasing app

- Run `npm run release:patch`.
This bumps to the next version, creates a tag and creates a Github Release. 
- On the window that pops choose release name, description and click **Publish Release**.
This publishes the release and triggers the Github Action workflow that uploads the zip with the pilas-bloques-api files. 

## Deploying app

- https://github.com/fundacion-sadosky/containerization
