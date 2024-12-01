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
    if (error instanceof SyntaxError) {
      logger.error(`SyntaxError: ${error.message}`, {
        stack: error.stack,
        input: event.body
      })
    } else if (error instanceof TypeError) {
      logger.error(`TypeError: ${error.message}`, {
        stack: error.stack,
        input: event.pathParameters
      })
    } else if (error instanceof RangeError) {
      logger.error(`RangeError: ${error.message}`, {
        stack: error.stack,
        input: event.queryStringParameters
      })
    } else {
      logger.error(`Error: ${error.message}`, {
        stack: error.stack,
        input: {
          pathParameters: event.pathParameters,
          body: event.body,
          headers: event.headers
        }
      })
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Show stack trace only in development
      })
    }
  }
}
