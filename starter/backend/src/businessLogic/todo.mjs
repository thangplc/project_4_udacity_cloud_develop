import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as uuid from 'uuid'
import {
  getAll,
  create,
  update,
  updateUrl,
  _delete
} from '../dataLayer/todoAccess.mjs'

const getTodos = async (userId) => {
  return getAll(userId)
}

const createNewTodo = (todoData, userId) => {
  todoData = {
    ...todoData,
    todoId: uuid.v4(),
    userId: userId,
    createdAt: new Date().toString(),
    done: false
  }
  return create(todoData)
}

const updateTodo = (todoId, updatedTodo, userId) => {
  try {
    if (!todoId) {
      throw new Error('todoId is required.')
    }
    if (!userId) {
      throw new Error('userId is required.')
    }
    if (!updatedTodo || typeof updatedTodo !== 'object') {
      throw new Error('updatedTodo must be a valid object.')
    }
    if (
      !updatedTodo.name ||
      !updatedTodo.dueDate ||
      updatedTodo.done === undefined
    ) {
      throw new Error('updatedTodo must include name, dueDate, and done.')
    }

    // Proceed with the update operation
    return update(todoId, updatedTodo, userId)
  } catch (error) {
    console.error('Error in updateTodoHandler:', error.message)
    throw new Error('Could not process the update request. ' + error.message)
  }
}

const deleteTodo = (todoId, userId) => {
  try {
    if (!todoId) {
      throw new Error('todoId is required.')
    }
    if (!userId) {
      throw new Error('userId is required.')
    }

    return _delete(todoId, userId)
  } catch (error) {
    console.error('Error in deleteTodoHandler:', error.message)
    throw new Error('Could not process the delete request. ' + error.message)
  }
}

const generateSignedUrl = async (todoId, userId) => {
  const { S3_BUCKET: bucketName, SIGNED_URL_EXPIRATION } = process.env
  const urlExpiration = parseInt(SIGNED_URL_EXPIRATION, 10)
  const s3Client = new S3Client()
  if (!bucketName || !SIGNED_URL_EXPIRATION) {
    throw new Error('Missing required environment variables.')
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: urlExpiration
    })

    await updateUrl(todoId, userId, bucketName)

    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error.message)
    throw new Error('Failed to generate signed URL. Please try again later.')
  }
}

export { getTodos, createNewTodo, updateTodo, generateSignedUrl, deleteTodo }
