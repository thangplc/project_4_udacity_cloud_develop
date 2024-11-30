import { verifyToken } from '../../utils/auth.mjs'
import { updateTodo } from '../../businessLogic/todo.mjs'

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const jwtToken = await verifyToken(event.headers.Authorization)
  const userId = jwtToken.sub
  const updatedTodo = JSON.parse(event.body)

  try {
    await updateTodo(todoId, updatedTodo, userId)
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
