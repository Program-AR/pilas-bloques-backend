export const username = 'USERNAME'
export const password = 'PASSWORD'
export const parentDNI = 'DNI'

export const userJson = {
  username: username.toLowerCase(),
  password,
  parentName: 'string',
  parentDNI,
  context: {
    experimentGroup: 'treatment'
  },
  profile: {
    nickName: username,
    avatarURL: 'string'
  }
}