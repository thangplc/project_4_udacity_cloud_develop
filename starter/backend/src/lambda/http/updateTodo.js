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
