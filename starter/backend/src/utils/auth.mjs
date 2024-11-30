import jsonwebtoken from 'jsonwebtoken'

export function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  return jwt.payload
}

export async function getUserId(authHeader) {
  console.log('22222222', authHeader);
  const jwtToken = await verifyToken(authHeader)
  return jwtToken.sub
}
