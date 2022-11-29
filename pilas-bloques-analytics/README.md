¡Hola! :vulcan_salute: Este es un proyecto relacionado a [Pilas Bloques](https://pilasbloques.program.ar) :heart:. En el repositorio de ese proyecto encontrarás las guías sobre [cómo contribuir](https://github.com/Program-AR/pilas-bloques/blob/develop/CONTRIBUTING.md) y el [código de conducta](https://github.com/Program-AR/pilas-bloques/blob/develop/CODE_OF_CONDUCT.md), que son guías que aplican también a este proyecto.

Hi! :vulcan_salute: This is a project related to [Pilas Bloques](https://pilasbloques.program.ar) :heart:. In that project's repository you'll find the [contribution guidelines](https://github.com/Program-AR/pilas-bloques/blob/develop/CONTRIBUTING_en.md) and the [code of conduct](https://github.com/Program-AR/pilas-bloques/blob/develop/CODE_OF_CONDUCT_en.md) which also apply to this project.

# Pilas Bloques Analytics
REST-API for logging Pilas Bloques usage for scientific purposes.

## Requisites
- [Nodejs](https://nodejs.org/es/) (v12 >=)
- [MonngoDB](https://www.mongodb.com/) (TODO: use Docker)

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
This publishes the release and triggers the Github Action workflow that uploads the zip with the pilas-bloques-analytics files. 

## Deploying app

- https://github.com/fundacion-sadosky/containerization
