import describeApi from './describeApi'

describeApi('Server', (request) => {

  test('is working', () =>
    request().get('/ping').expect(200, 'pong')
  )

})