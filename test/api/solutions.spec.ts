import { NextFunction } from 'express'
import { userFingerprint } from '../../src/api/routes/middlewares'
import describeApi from './describeApi'
import { fetchCalled, fetchBodyMatch, hasBodyProperty, matchBody } from './utils'

const analytics = process.env.API_PB_ANALYTICS_URI as string

describeApi('Solutions', (request, { authenticated }) => {

  describe('Analytics mirroring', () => {
    analyticsTest('/challenges')
    analyticsTest('/solutions')
    analyticsTest('/solutions/1', 'put')
  })

  function analyticsTest(uri: string, method = 'post') {
    test(`${method.toUpperCase()} ${uri} should mirror to analytics`, () =>
      request()[method](uri)
        .send({ test: true })
        .expect(200)
        .then(fetchCalled(analytics))
        .then(fetchBodyMatch({ test: true }))
    )
  }

  describe('Solutions', () => {

    describe('POST /solutions', () => {

      test('should create new last challenges solution', () =>
        request().post(authenticated('/solutions'))
          .send(solutionJson)
          .expect(200)
          .then(hasBodyProperty('upserted'))
      )

      test('should update last challenges solution', async () => {
        await request().post(authenticated('/solutions')).send(solutionJson).expect(200)
        await request().post(authenticated('/solutions'))
          .send({ ...solutionJson, solutionId: '11111' })
          .expect(200)
          .then(matchBody({ "nModified": 1 }))
      })

      test('without authentication should do nothing', () =>
        request().post('/solutions')
          .send(solutionJson)
          .expect(200, {})
      )

    })

    describe('PUT /solutions/:id', () => {

      beforeEach(() => request().post(authenticated('/solutions')).send(solutionJson))

      test('should update existing solution', () =>
        request().put(authenticated(`/solutions/${solutionId}`))
          .send(executionJson)
          .expect(200)
          .then(matchBody(executionJson))
      )

      test('without authentication should do nothing', () =>
        request().put(`/solutions/${solutionId}`)
          .send(solutionJson)
          .expect(200, {})
      )

    })


    describe('GET /challenges/:id/solution', () => {

      beforeEach(() => request().post(authenticated('/solutions')).send(solutionJson))

      test('should retrieve last challenges solution', () =>
        request().get(authenticated(`/challenges/${challengeId}/solution`))
          .expect(200)
          .then(matchBody(solutionJson))
      )

      test('should retrieve null for not existing challenges solution', () =>
        request().get(authenticated(`/challenges/12345/solution`))
          .expect(200, null)
      )

      test('without authentication should be unauthrized', () =>
        request().get(`/challenges/${challengeId}/solution`)
          .expect(400, 'Missing access token')
      )

    })

  })

  describe('User fingerprint cookies', () => {

    let req
    const res = { cookie: jest.fn() }
    const next = jest.fn();

    beforeEach(()=>{
      req = { body: { context: { userId: undefined } }  }
    })

    test('Should not set a new cookie if it already exists', () => {
      userFingerprint( {...req, cookies: { fingerprint: '123' } }, res, next)
      expect(res.cookie).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    }) 

    test('Should set a new cookie if there are cookies in the request, but there is no fingerprint', () =>{
      userFingerprint( {...req, cookies: { someCookie: 1 } }, res, next)
      expect(res.cookie).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    test('Should create a new cookie if it does not exist', () =>{
      userFingerprint(req, res, next)
      expect(res.cookie).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    test('Should add userId to the request if it does not exist', () =>{
      userFingerprint(req, res, next)
      expect(req.body.context.userId).toBeDefined()
    })

    test('Should not add userId to the request if exist (user authenticated)', () =>{
      let reqWithUserId = {...req, body: { context: { userId: "123" } } }  
      userFingerprint(reqWithUserId, res, next)
      expect(reqWithUserId.body.context.userId).toBeDefined()
    })
  })
  
    
})

const solutionId = "00000000"
const challengeId = "0"

const solutionJson = {
  challengeId,
  program: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><variables></variables><block type=\"al_empezar_a_ejecutar\" id=\"Wuo/r0T7yFU_T(sKjdp3\" deletable=\"false\" movable=\"false\" editable=\"false\" x=\"266\" y=\"15\"><statement name=\"program\"><shadow type=\"required_statement\" id=\"!)9FRrV-;Fa)5,|zGH7p\"></shadow><block type=\"ComerChurrasco\" id=\"VD%y]G|;3Y01|u~Kn2Q{\"></block></statement></block></xml>",
  solutionId,
  staticAnalysis: { couldExecute: true },
}

const executionJson = {
  executionResult: {
    isTheProblemSolved: false,
    error: "¡Acá no hay churrasco!"
  }
}