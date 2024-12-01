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
  logger.error(`Error creating new todo for userId ${userId}: ${error.message}`, {
    stack: error.stack,
    input: { newTodo, userId },
  });

  let statusCode = 500;
  let errorMessage = 'Internal Server Error';

  if (error.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    errorMessage = 'Invalid input data provided.';
  } else if (error.name === 'ConditionalCheckFailedException') {
    statusCode = 409; // Conflict
    errorMessage = 'Todo item already exists or cannot be updated due to conditions.';
  } else if (error.name === 'AccessDeniedException') {
    statusCode = 403; // Forbidden
    errorMessage = 'Access denied. Please check your permissions.';
  } else if (error.name === 'ServiceUnavailableException') {
    statusCode = 503; // Service Unavailable
    errorMessage = 'The service is temporarily unavailable. Please try again later.';
  }

  // Return error response
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      error: errorMessage,
      details: error.message,
    }),
  };
  }
}
