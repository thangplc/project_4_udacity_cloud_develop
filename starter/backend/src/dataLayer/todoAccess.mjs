import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const dynamoDbClient = DynamoDBDocument.from(
  AWSXRay.captureAWSv3Client(new DynamoDB())
  // new DynamoDB()
)
const todosTable = process.env.TODOS_TABLE

export default {
  getAll: async (userId) => {
    const result = await dynamoDbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    return result.Items
  },
  create: async (newTodo) => {
    await dynamoDbClient.put({
      TableName: todosTable,
      Item: newTodo
    })
    return newTodo
  },

  update: async (todoId, updatedTodo, userId) => {
    return dynamoDbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      }
    })
  },

  delete: async (todoId, userId) => {
    return dynamoDbClient.delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })
  },

  updateUrl: async (todoId, userId, bucketName) => {
    return await dynamoDbClient.update({
      TableName: todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
      }
    })
  }
}
