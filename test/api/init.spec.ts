import describeApi from './describeApi'

describeApi('Users', (request) => {  
  test('is working', () =>
    request().get('/ping').expect(200, 'pong')
  )
})