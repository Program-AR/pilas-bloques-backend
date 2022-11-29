import describeApi from './describeApi'
import { matchBody, hasBodyProperty, emailSent, cApItAlIzE } from './utils'
import { userJson, username, password, parentDNI } from './sessionMock'
import { newToken } from '../src/models/auth'
import { User } from 'pilas-bloques-models'

describeApi('Users', (request, { authenticated, token }) => {

  describe('POST /register', () => {
    test('Do register', () =>
      request().post('/register')
        .send({ ...userJson, username: 'RANDOM', profile: { nickName: 'NICK' } })
        .expect(200)
        .then(matchBody({ nickName: 'NICK' }))
        .then(hasBodyProperty('id'))
        .then(hasBodyProperty('token'))
        .then(hasBodyProperty('answeredQuestionIds'))
        .then(hasBodyProperty('experimentGroup'))
    )

    test('Register fails for required attributes', () =>
      request().post('/register')
        .send({ username, password, context: {experimentGroup: 'treatment'} })
        .expect(400, 'Path `parentDNI` is required.\nPath `parentName` is required.')
    )

    // SKIP: Not working in testing enviroment
    test.skip('Register existing username', () =>
      request().post('/register')
        .send(userJson)
        .expect(400, 'Duplicate key error.')
    )

    // SKIP: Not working in testing enviroment
    test.skip('Register existing username with different capitalization', () =>
      request().post('/register')
        .send({ ...userJson, username: cApItAlIzE(username) })
        .expect(400, 'Duplicate key error.')
    )
  })


  describe('POST /login', () => {
    const expectLoginOK = (user: string) => () =>
      request().post('/login')
        .send({ username, password })
        .expect(200)
        .then(matchBody({ nickName: userJson.profile.nickName }))
        .then(hasBodyProperty('id'))
        .then(hasBodyProperty('token'))
        .then(hasBodyProperty('answeredQuestionIds'))

    test('Do login',
      expectLoginOK(username)
    )

    test('Login using different username capitalization still works',
      expectLoginOK(cApItAlIzE(username))
    )

    test('Login wrong credentials', () =>
      request().post('/login')
        .send({ username: 'NOT_EXIST', password: 'WRONG' })
        .expect(400, 'Wrong credentials')
    )

    test('Login missing params', () =>
      request().post('/login')
        .send({})
        .expect(400, 'Missing body parameters: username, password')
    )
  })


  describe('PUT /credentials', () => {
    test('Change credentials by parent DNI', async () => {
      await request().put('/credentials')
        .send({ username, parentDNI, password: "NEW PASSWORD" })
        .expect(200)
        .then(hasBodyProperty('token'))

      await request().post('/login')
        .send({ username, password: "NEW PASSWORD" })
        .expect(200)
    })

    test('Change credentials by token', async () => {
      await request().put('/credentials')
        .send({ token: token(), password: "NEW PASSWORD" })
        .expect(200)
        .then(hasBodyProperty('token'))

      await request().post('/login')
        .send({ username, password: "NEW PASSWORD" })
        .expect(200)
    })

    test('Change credentials fails', () =>
      request().put('/credentials')
        .send({ username, parentDNI: 'WRONG', password })
        .expect(400, 'Wrong credentials')
    )

    test('Missing auth info', () =>
      request().put('/credentials')
        .send({ username, password })
        .expect(400, 'Missing body parameters: parentDNI')
    )


  })

  describe('Password restore token expiration', () => {
    const oldToken = newToken({ _id: username } as User, 0)

    test('Trying to restore a password with an expired token fails', async () => {
      await request().put('/credentials')
        .send({ token: oldToken, password: "NEW PASSWORD" })
        .expect(401)
    })

  })

  describe('POST /password-recovery', () => {

    test('Send email', async () => {
      await request().post('/register').send({ ...userJson, username: 'TEST', email: 'lita.sadosky@program.ar' })
      await request().post(`/password-recovery?username=TEST`)
        .expect(200)
        .then(emailSent('Cambiar tu contraseña de Pilas Bloques'))
        .then(matchBody({ email: 'l**********y@program.ar' }))
    })

    test('Does not send email', async () => {
      await request().post(`/password-recovery?username=${username}`)
        .expect(200)
        .then(matchBody({ email: null }))
    })

    test('User does not exists', async () => {
      await request().post(`/password-recovery?username=FAKE`)
        .expect(404, 'User does not exist')
    })
  })


  describe('GET /profile', () => {
    test('Profile', () =>
      request().get(authenticated(`/profile`))
        .send()
        .expect(200)
        .then(matchBody(userJson.profile))
    )

    test('Profile missing access token', () =>
      request().get(`/profile`)
        .send()
        .expect(400, 'Missing access token')
    )

    test('Profile unauthorized', () =>
      request().get(`/profile?access_token=FAKE`)
        .send()
        .expect(401, 'Unauthorized')
    )
  })


  describe('GET /users/exists', () => {
    test('Check new username', () =>
      request().get(`/users/exists?username=RANDOM`)
        .send()
        .expect(200, 'false')
    )

    test('Check used username', () =>
      request().get(`/users/exists?username=${username}`)
        .send()
        .expect(200, 'true')
    )

    test('Check used username with different capitalization', () =>
      request().get(`/users/exists?username=${cApItAlIzE(username)}`)
        .send()
        .expect(200, 'true')
    )

    test('Check missing parameter', () =>
      request().get(`/users/exists`)
        .send()
        .expect(400, 'Missing query parameters: username')
    )
  })

  test('POST /answers', () =>
    request().post(authenticated(`/answers`))
      .send({ question: { id: 1 }, response: { text: "RESPONSE" } })
      .expect(200)
      .then(matchBody({ answeredQuestionIds: [1] }))
  )

  test('PUT /experiment-group', () =>
    request().put(authenticated(`/experiment-group`))
      .send({ group: "treatment"})
      .expect(200)
      .then(matchBody({ experimentGroup: "treatment"}))
  )
})
