¡Hola! :vulcan_salute: Este es un proyecto relacionado a [Pilas Bloques](https://pilasbloques.program.ar) :heart:. En el repositorio de ese proyecto encontrarás las guías sobre [cómo contribuir](https://github.com/Program-AR/pilas-bloques/blob/develop/CONTRIBUTING.md) y el [código de conducta](https://github.com/Program-AR/pilas-bloques/blob/develop/CODE_OF_CONDUCT.md), que son guías que aplican también a este proyecto.

Hi! :vulcan_salute: This is a project related to [Pilas Bloques](https://pilasbloques.program.ar) :heart:. In that project's repository you'll find the [contribution guidelines](https://github.com/Program-AR/pilas-bloques/blob/develop/CONTRIBUTING_en.md) and the [code of conduct](https://github.com/Program-AR/pilas-bloques/blob/develop/CODE_OF_CONDUCT_en.md) which also apply to this project.


# Pilas Bloques Backend
This project contains the following sub-projects:

- **Pilas Bloques API**: REST-API for Pilas Bloques app.
- **Pilas Bloques Analytics**: REST-API for logging Pilas Bloques usage for scientific purposes.
- **Pilas Bloques Consumer**: Pilas Bloques data users consumer for scientific purposes. Consumes data from Pilas Bloques Analytics' database.

## Requisites
- [Nodejs](https://nodejs.org/es/) (v12 >=)
- [MongoDB](https://www.mongodb.com/). This can be done by running a docker image:

Docker run example:
```
docker run -d --rm -p 27017:27017 -v $HOME/mongoData:/data/db --name mongoPilasBloques mongo:5.0.5
```

## Config project
- Checkout this repository.
- Create `.env` file with the required enviroments variables. You can copy from [`sample.env`](sample.env)
- Make sure you are using the correct node version running `nvm use`
- Run `npm install`

## Running app
> Remember to start the DB before!

For development
- Run `npm run dev` for server starts. Any file change should re-run it. This command only starts API and Analytics servers. It's important to NOT close those tabs (API and Analytics) before ending the processes (using `CTRL + C`); otherwise you will need to kill it manually (using [`fuser`](https://linux.die.net/man/1/fuser) command).

For production
- Run `npm run build` for make `dist` directory. (TODO)
- Run `npm start:[sub-project]` for server starts. The options are `api`, `anaytics` and `consumer`

## Running tests

All tests
- Run `npm test`

If you want to test a specific sub-project, run `npm test:[sub-project]`, with the options: `api`, `analytics` and `consumer`.

Only one file
- Run `npm test -- -f <FILE_PATH>`

## Releasing app

- Run `npm run release:patch`.
This bumps to the next version, creates a tag and creates a Github Release. 
- On the window that pops choose release name, description and click **Publish Release**.
This publishes the release and triggers the Github Action workflow that uploads the zip with the pilas-bloques-api files. 

## Deploying app

- https://github.com/fundacion-sadosky/containerization
