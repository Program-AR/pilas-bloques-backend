import describeApi from './describeApi'
import { hasBodyProperty, matchBody } from './utils'

describeApi('User challenges', (request, { authenticated }) => {


  const userChallenge = {
    fileVersion: 1,
    title: 'Escribí tu título...',
    statement: { description: 'Así se verá tu **enunciado**...' },
    scene: { type: "Duba", "maps": [[["A", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]]] },
    toolbox: { blocks: ["MoverACasillaDerecha"] },
    stepByStep: true,
    shareId: ''
  }


  const createChallenge = async (challenge) => (await request().post(authenticated('/userChallenge')).send(challenge)).body

  test('should create challenge on POST', () =>
    request().post(authenticated('/userChallenge'))
      .send(userChallenge)
      .expect(200)
      .then(hasBodyProperty('sharedId'))
  )

  test('should retrieve user challenge on GET if it exists', async () => {
    let challenge = await createChallenge(userChallenge)

    return request().get(`/userChallenge/${challenge.sharedId}`)
      .expect(200)
      .then(matchBody(challenge))

  })

  test('should retrieve null for not existing user challenge', () =>
    request().get(authenticated(`/userChallenge/12345`))
      .expect(200, null)
  )

  //This case happens when someone logs out and then logs in a different account
  test('should create a challenge on PUT if it does not exist on the logged user challenges', async () =>
    request().put(authenticated(`/userChallenge/1234`))
      .send(userChallenge)
      .expect(200)
      .then(hasBodyProperty('sharedId'))
  )

  test('should update challenge if it does exist', async () => {
    let challenge = await createChallenge(userChallenge)
    let updatedChallenge = {...challenge, title: 'nuevo enunciado'}

    return request().put(authenticated(`/userChallenge/${challenge.sharedId}`))
      .send(updatedChallenge)
      .expect(200)
      .then(matchBody(updatedChallenge))

  })

})