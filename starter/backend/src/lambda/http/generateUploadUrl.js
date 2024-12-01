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
    logger.error(
      `Error generating signed URL for todoId ${todoId}: ${error.message}`,
      {
        stack: error.stack,
        input: { todoId, Authorization: event.headers.Authorization }
      }
    )

    let statusCode = 500
    let errorMessage = 'Internal Server Error'

    if (error.name === 'UnauthorizedError') {
      statusCode = 401 // Unauthorized
      errorMessage =
        'Authentication failed. Invalid or missing authorization token.'
    } else if (error.name === 'UserNotFoundError') {
      statusCode = 404 // Not Found
      errorMessage = 'User not found.'
    } else if (error.name === 'SignedUrlGenerationError') {
      statusCode = 500 // Internal Server Error
      errorMessage = 'Error generating signed URL for the todo item.'
    } else if (error.name === 'AccessDeniedException') {
      statusCode = 403 // Forbidden
      errorMessage =
        'You do not have permission to generate a signed URL for this todo.'
    }

    // Return error response
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: errorMessage,
        details: error.message
      })
    }
  }
}
