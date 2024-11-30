import { getUserId } from '../../utils/auth.mjs'
import { generateSignedUrl } from '../../businessLogic/todo.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('generateUpdateUrl')

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  logger.info('Generating signed URL for TODO ' + todoId)

  try {
    const userId = await getUserId(event.headers.Authorization)
    const signedUrl = await generateSignedUrl(todoId, userId)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ uploadUrl: signedUrl })
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error })
    }
  }
}
