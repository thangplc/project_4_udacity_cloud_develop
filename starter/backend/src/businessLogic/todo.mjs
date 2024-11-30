import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as uuid from 'uuid'
import todoAccess from '../dataLayer/todoAccess.mjs'

export async function getTodos(userId) {
  return todoAccess.getAll(userId)
}

export async function createNewTodo(todoData, userId) {
  todoData.todoId = uuid.v4()
  todoData.userId = userId
  todoData.createdAt = new Date().toString()
  todoData.done = false
  return todoAccess.create(todoData)
}

export async function updateTodo(todoId, updatedTodo, userId) {
  return todoAccess.update(todoId, updatedTodo, userId)
}

export async function deleteTodo(todoId, userId) {
  return todoAccess.delete(todoId, userId)
}

export async function generateSignedUrl(todoId, userId) {
  const bucketName = process.env.IMAGES_S3_BUCKET
  const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)
  const s3Client = new S3Client()
  let command = new PutObjectCommand({ Bucket: bucketName, Key: todoId })
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })

  await todoAccess.updateUrl(todoId, userId, bucketName)
  return signedUrl
}
