import { disconnectDB, startDB } from '../utils'

export default (name: string, tests: () => void) =>
  describe(name, () => {
    beforeAll(() => startDB())
    afterAll(() => disconnectDB())
    tests()
  })