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
