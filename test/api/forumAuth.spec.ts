import describeApi from './describeApi'
import { matchBody, hasBodyProperty, emailSent } from './utils'
import { userJson, username, password } from './sessionMock'
import { ForumVerificationCodeModel } from '../../src/models/forumVerificationCode'
import { UserModel } from '../../src/models/user'

describeApi('Forum Authentication & Authorization', (request, { authenticated, token }) => {

  describe('POST /logout', () => {
    test('Clears foro_session cookie', async () => {
      await request().post('/logout')
        .send()
        .expect(200)
        .expect('set-cookie', /foro_session=;/)
        .then(matchBody({ ok: true }))
    })
  })

  describe('GET /forum/status', () => {
    test('User without email has hasEmail: false', async () => {
      await request().get(authenticated('/forum/status'))
        .expect(200)
        .then(matchBody({
          hasEmail: false,
          email: null,
          isVerified: false,
          hasMultipleAccounts: false,
          canAccessForum: false
        }))
    })

    test('User with unique email returns status correctly', async () => {
      // Register new user with email
      const res = await request().post('/register')
        .send({ ...userJson, username: 'USER_WITH_MAIL', email: 'user1@program.ar' })
        .expect(200)

      const userToken = res.body.token

      await request().get(`/forum/status?access_token=${userToken}`)
        .expect(200)
        .then(matchBody({
          hasEmail: true,
          email: 'user1@program.ar',
          isVerified: false,
          hasMultipleAccounts: false,
          canAccessForum: false
        }))
    })

    test('Multiple users with same email are detected in status', async () => {
      const sharedEmail = 'shared@program.ar'

      const res1 = await request().post('/register')
        .send({ ...userJson, username: 'CHILD_ONE', email: sharedEmail, profile: { nickName: 'Child 1' } })
        .expect(200)

      await request().post('/register')
        .send({ ...userJson, username: 'CHILD_TWO', email: sharedEmail, profile: { nickName: 'Child 2' } })
        .expect(200)

      const resStatus = await request().get(`/forum/status?access_token=${res1.body.token}`)
        .expect(200)

      expect(resStatus.body.hasMultipleAccounts).toBe(true)
      expect(resStatus.body.accountsWithSameEmail).toHaveLength(2)
      expect(resStatus.body.canAccessForum).toBe(false)
    })
  })

  describe('POST /forum/send-code', () => {
    test('Fails without email if user has no email', async () => {
      await request().post(authenticated('/forum/send-code'))
        .send({})
        .expect(400, 'Email is required')
    })

    test('Fails with invalid email format', async () => {
      await request().post(authenticated('/forum/send-code'))
        .send({ email: 'invalid-email-format' })
        .expect(400, 'Invalid email format')
    })

    test('Sends verification code email successfully', async () => {
      await request().post(authenticated('/forum/send-code'))
        .send({ email: 'lita.sadosky@program.ar' })
        .expect(200)
        .then(emailSent('Código de ingreso al Foro de Pilas Bloques'))
        .then(matchBody({ ok: true, email: 'lita.sadosky@program.ar' }))

      // Verify code was created in database
      const codeRecord = await ForumVerificationCodeModel.findLatestByEmail('lita.sadosky@program.ar')
      expect(codeRecord).not.toBeNull()
      expect(codeRecord.code).toHaveLength(6)
    })
  })

  describe('POST /forum/verify-code', () => {
    test('Fails with invalid or non-existing code', async () => {
      await request().post(authenticated('/forum/verify-code'))
        .send({ email: 'test@program.ar', code: '000000' })
        .expect(400, 'Verification code expired or not found')
    })

    test('Fails with wrong code and tracks attempts', async () => {
      const email = 'verify-attempts@program.ar'
      await request().post(authenticated('/forum/send-code'))
        .send({ email })
        .expect(200)

      await request().post(authenticated('/forum/verify-code'))
        .send({ email, code: '123456' })
        .expect(400, 'Invalid verification code')

      const record = await ForumVerificationCodeModel.findLatestByEmail(email)
      expect(record.attempts).toBe(1)
    })

    test('Successful verification for single account sets cookie and updates user', async () => {
      const email = 'single-user@program.ar'
      await request().post(authenticated('/forum/send-code'))
        .send({ email })
        .expect(200)

      const record = await ForumVerificationCodeModel.findLatestByEmail(email)

      await request().post(authenticated('/forum/verify-code'))
        .send({ email, code: record.code })
        .expect(200)
        .expect('set-cookie', /foro_session=/)
        .then(matchBody({ ok: true, isPrimary: true, canAccessForum: true }))

      // User in DB should now have email, isForumPrimary and forumVerifiedAt
      const user = await UserModel.findByUsername(username).exec()
      expect(user.email).toBe(email)
      expect(user.isForumPrimary).toBe(true)
      expect(user.forumVerifiedAt).toBeDefined()
    })

    test('Multiple accounts require selecting primary user', async () => {
      const sharedEmail = 'multiacct@program.ar'

      const user1Res = await request().post('/register')
        .send({ ...userJson, username: 'MULTI_1', email: sharedEmail })
        .expect(200)

      const user2Res = await request().post('/register')
        .send({ ...userJson, username: 'MULTI_2', email: sharedEmail })
        .expect(200)

      await request().post(`/forum/send-code?access_token=${user1Res.body.token}`)
        .send({ email: sharedEmail })
        .expect(200)

      const record = await ForumVerificationCodeModel.findLatestByEmail(sharedEmail)

      // Verifying without selectedPrimaryUserId must fail
      await request().post(`/forum/verify-code?access_token=${user1Res.body.token}`)
        .send({ email: sharedEmail, code: record.code })
        .expect(400, 'Multiple accounts found. Please select a primary user.')

      // Verifying with selectedPrimaryUserId sets primary user
      await request().post(`/forum/verify-code?access_token=${user1Res.body.token}`)
        .send({ email: sharedEmail, code: record.code, selectedPrimaryUserId: user1Res.body.id })
        .expect(200)
        .expect('set-cookie', /foro_session=/)
        .then(matchBody({
          ok: true,
          isPrimary: true,
          selectedPrimaryUsername: 'multi_1',
          canAccessForum: true
        }))

      const u1 = await UserModel.findById(user1Res.body.id).exec()
      const u2 = await UserModel.findById(user2Res.body.id).exec()
      expect(u1.isForumPrimary).toBe(true)
      expect(u2.isForumPrimary).toBe(false)
    })
  })

  describe('POST /forum/session', () => {
    test('Non-primary account is forbidden from creating session', async () => {
      const sharedEmail = 'session-test@program.ar'

      const u1Res = await request().post('/register')
        .send({ ...userJson, username: 'SESSION_PRIM', email: sharedEmail })
        .expect(200)

      const u2Res = await request().post('/register')
        .send({ ...userJson, username: 'SESSION_SEC', email: sharedEmail })
        .expect(200)

      // Verify and set u1 as primary
      await request().post(`/forum/send-code?access_token=${u1Res.body.token}`)
        .send({ email: sharedEmail })
        .expect(200)

      const record = await ForumVerificationCodeModel.findLatestByEmail(sharedEmail)
      await request().post(`/forum/verify-code?access_token=${u1Res.body.token}`)
        .send({ email: sharedEmail, code: record.code, selectedPrimaryUserId: u1Res.body.id })
        .expect(200)

      // Now u2 tries to get forum session
      await request().post(`/forum/session?access_token=${u2Res.body.token}`)
        .send()
        .expect(403)
    })

    test('Primary verified account gets forum session cookie', async () => {
      const sharedEmail = 'session-ok@program.ar'

      const u1Res = await request().post('/register')
        .send({ ...userJson, username: 'SESSION_OK', email: sharedEmail })
        .expect(200)

      await request().post(`/forum/send-code?access_token=${u1Res.body.token}`)
        .send({ email: sharedEmail })
        .expect(200)

      const record = await ForumVerificationCodeModel.findLatestByEmail(sharedEmail)
      await request().post(`/forum/verify-code?access_token=${u1Res.body.token}`)
        .send({ email: sharedEmail, code: record.code, selectedPrimaryUserId: u1Res.body.id })
        .expect(200)

      await request().post(`/forum/session?access_token=${u1Res.body.token}`)
        .send()
        .expect(200)
        .expect('set-cookie', /foro_session=/)
        .then(matchBody({ ok: true }))
    })
  })
})
