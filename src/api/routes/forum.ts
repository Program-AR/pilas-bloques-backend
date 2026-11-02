import * as express from 'express'
import { syncHandler, AuthenticatedRequest } from './utils'
import { tokenAuth, requiredBody } from './middlewares'
import { ClientError, Forbidden } from './errorHandlers'
import { forumVerificationMail } from '../mailing/mails'
import { User, UserModel } from '../../models/user'
import { ForumVerificationCodeModel, generateVerificationCode, MAX_VERIFICATION_ATTEMPTS } from '../../models/forumVerificationCode'
import { setForoCookie, clearForoCookie } from './forumCookies'

const router = express.Router()

router.get('/status', tokenAuth, syncHandler(async ({ user }: AuthenticatedRequest, res) => {
  const hasEmail = Boolean(user.email)
  if (!hasEmail) {
    res.json({
      hasEmail: false,
      email: null,
      isVerified: false,
      hasMultipleAccounts: false,
      accountsWithSameEmail: [],
      isCurrentAccountPrimary: false,
      primaryAccountUsername: null,
      canAccessForum: false
    })
    return
  }

  const accounts = await UserModel.findAllByEmail(user.email).exec()
  const primaryAccount = accounts.find(a => a.isForumPrimary)
  const hasMultipleAccounts = accounts.length > 1
  const isCurrentAccountPrimary = hasMultipleAccounts ? Boolean(user.isForumPrimary) : true
  const isVerified = Boolean(user.forumVerifiedAt)
  const canAccessForum = isCurrentAccountPrimary && isVerified

  res.json({
    hasEmail: true,
    email: user.email,
    isVerified,
    hasMultipleAccounts,
    accountsWithSameEmail: accounts.map(a => ({
      id: a._id,
      username: a.username,
      nickName: a.profile?.nickName || a.username,
      isForumPrimary: Boolean(a.isForumPrimary)
    })),
    isCurrentAccountPrimary,
    primaryAccountUsername: primaryAccount ? primaryAccount.username : null,
    canAccessForum
  })
}))

router.post('/send-code', tokenAuth, syncHandler(async ({ user, body, transport }: AuthenticatedRequest, res) => {
  const emailInput = body?.email || user.email
  if (!emailInput) throw new ClientError('Email is required')

  const email = emailInput.toLowerCase().trim()
  if (!email.includes('@')) throw new ClientError('Invalid email format')

  const code = generateVerificationCode()

  await ForumVerificationCodeModel.deleteMany({ email })
  await ForumVerificationCodeModel.create({
    email,
    userId: user._id.toString(),
    code
  })

  try {
    await transport.sendMail(forumVerificationMail(user, email, code))
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[DEV SMTP WARNING] No se pudo enviar email a ${email}: ${err.message}`)
      console.log(`🔑 [DEV OTP CODE] Tu código de verificación para ${email} es: ${code}`)
    } else {
      throw err
    }
  }

  res.json({ ok: true, email })
}))

router.post('/verify-code', tokenAuth, requiredBody('code'), syncHandler(async ({ user, body }: AuthenticatedRequest, res) => {
  const emailInput = body?.email || user.email
  if (!emailInput) throw new ClientError('Email is required')

  const email = emailInput.toLowerCase().trim()
  const verification = await ForumVerificationCodeModel.findLatestByEmail(email)

  if (!verification) throw new ClientError('Verification code expired or not found')
  if (verification.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    throw new ClientError('Too many failed attempts. Please request a new code.')
  }

  if (verification.code !== body.code.trim()) {
    verification.attempts += 1
    await verification.save()
    throw new ClientError('Invalid verification code')
  }

  if (!user.email) {
    user.email = email
  }

  const accounts = await UserModel.findAllByEmail(email).exec()

  if (accounts.length > 1) {
    if (!body.selectedPrimaryUserId) {
      throw new ClientError('Multiple accounts found. Please select a primary user.')
    }

    const selectedUser = accounts.find(a => a._id.toString() === body.selectedPrimaryUserId.toString())
    if (!selectedUser) throw new ClientError('Selected user does not belong to this email')

    await ForumVerificationCodeModel.deleteOne({ _id: verification._id })

    for (const acc of accounts) {
      const isSelected = acc._id.toString() === selectedUser._id.toString()
      acc.isForumPrimary = isSelected
      if (isSelected) {
        acc.forumVerifiedAt = new Date()
      }
      await acc.save()
    }

    const updatedUser = await UserModel.findById(user._id).exec()
    if (updatedUser.isForumPrimary) {
      setForoCookie(res, updatedUser)
    }

    res.json({
      ok: true,
      isPrimary: updatedUser.isForumPrimary,
      selectedPrimaryUsername: selectedUser.username,
      canAccessForum: updatedUser.isForumPrimary
    })
    return
  }

  await ForumVerificationCodeModel.deleteOne({ _id: verification._id })

  user.isForumPrimary = true
  user.forumVerifiedAt = new Date()
  await user.save()

  setForoCookie(res, user)
  res.json({ ok: true, isPrimary: true, canAccessForum: true })
}))

router.post('/session', tokenAuth, syncHandler(async ({ user }: AuthenticatedRequest, res) => {
  if (!user.email) throw new Forbidden('User has no email associated')

  const accounts = await UserModel.findAllByEmail(user.email).exec()
  if (accounts.length > 1 && !user.isForumPrimary) {
    const primary = accounts.find(a => a.isForumPrimary)
    throw new Forbidden(`This account is not the primary account for forum access. Primary account: ${primary ? primary.username : 'None'}`)
  }

  if (!user.forumVerifiedAt) {
    throw new Forbidden('Account has not been verified for forum access')
  }

  setForoCookie(res, user)
  res.json({ ok: true })
}))

export default router
