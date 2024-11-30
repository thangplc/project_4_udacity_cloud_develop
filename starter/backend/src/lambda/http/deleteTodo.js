import { getUserId } from '../../utils/auth.mjs'
import { deleteTodo } from '../../businessLogic/todo.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('deleteTodo')

export async function handler(event) {
  const userId = await getUserId(event.headers.Authorization)
  const todoId = event.pathParameters.todoId
  logger.info('Deleting TODO ' + todoId)
  try {
    await deleteTodo(todoId, userId)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: undefined
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
