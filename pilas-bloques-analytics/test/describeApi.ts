import { createServer, Request, dropDB, disconnectDB } from './utils'

const describeApi = (name: string, cb: (resquest: () => Request) => void) => {

  describe(name, () => {
    let request: Request

    beforeAll(async () => {
      request = await createServer()
    })
    beforeEach(() => dropDB())
    afterAll(() => disconnectDB())

    cb(() => request)
  })

}

export default describeApi