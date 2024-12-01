import { createNewTodo } from '../../businessLogic/todo.mjs'
import { getUserId } from '../../utils/auth.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('createTodo')

export async function handler(event) {
  const userId = await getUserId(event.headers.Authorization)
  let newTodo = JSON.parse(event.body)
  logger.info('Creating new TODO...')
  try {
    newTodo = await createNewTodo(newTodo, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newTodo
      })
    }
  } catch (error) {
    logger.error(`Error: ${error.message}`, { error })

    let statusCode = 500
    let errorMessage = 'An unexpected error occurred.'

    if (error.message.includes('Invalid input')) {
      statusCode = 400 // Bad Request
      errorMessage = error.message
    } else if (error.message.includes('ConditionalCheckFailedException')) {
      statusCode = 409 // Conflict
      errorMessage = 'A conflict occurred while processing your request.'
    } else if (error.message.includes('DynamoDB')) {
      statusCode = 503 // Service Unavailable
      errorMessage = 'Database service is temporarily unavailable.'
    }

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: errorMessage
      })
    }
  }
}
