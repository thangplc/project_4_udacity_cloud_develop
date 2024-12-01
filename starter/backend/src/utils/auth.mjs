import jsonwebtoken from 'jsonwebtoken'

const getToken = (authenticateHeader) => {
  if (!authenticateHeader) throw new Error('No authentication header')
  if (!authenticateHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header')
  return authenticateHeader.split(' ')[1]
}

const verifyToken = async (authenticateHeader) => {
  return jsonwebtoken.decode(getToken(authenticateHeader), { complete: true }).payload
}

const getUserId = async (authenticateHeader) => {
  return await verifyToken(authenticateHeader).then((res) => {
    return res.sub
  })
}

export { getToken, verifyToken, getUserId }