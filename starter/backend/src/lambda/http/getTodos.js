import { getTodos } from '../../businessLogic/todo.mjs'
import { getUserId } from '../../utils/auth.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('getTodos')

export async function handler(event) {
  
  const userId = await getUserId(event.headers.Authorization)
  logger.info('Getting TODO for user ' + userId)

  try {
    const items = await getTodos(userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items
      })
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
