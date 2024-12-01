import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todoAccess')

const dynamoDbClient = DynamoDBDocument.from(
  AWSXRay.captureAWSv3Client(new DynamoDB())
  // new DynamoDB()
)
const todosTable = process.env.TODOS_TABLE

const getAll = async (userId) => {
  try {
    const result = await dynamoDbClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
    logger.info('Successfully fetching items');
    return result.Items;
  } catch (error) {
    logger.error('Error fetching items:', error);
    throw new Error('Could not fetch items. Please try again later.');
  }
}

const create = async (newTodo) => {
  try {
    await dynamoDbClient.put({
      TableName: todosTable,
      Item: newTodo,
    });
    logger.info('Create new todo successfully');
    return newTodo;
  } catch (error) {
    logger.error('Error adding new todo:', error);
    throw new Error('Could not add the new todo. Please try again later.');
  }
}

const update = async (todoId, updatedTodo, userId) => {
  
  try {
    const payloadBody = {
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
    }
    return await dynamoDbClient.update(payloadBody)
  } catch (error) {
    logger.error('Error updating todo:', error);
    throw new Error('Could not update the todo. Please try again later.');
  }
}

const _delete = async (todoId, userId) => {
  try {
    return dynamoDbClient.delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })
  } catch (error) {
    logger.error('Error delete todo:', error);
    throw new Error('Could not delete the todo. Please try again later.');
  }
}

const updateUrl = async (todoId, userId, bucketName) => {
  const payloadBody = {
    TableName: todosTable,
    Key: { userId, todoId },
    ConditionExpression: 'attribute_exists(todoId)',
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }
  }
  try {
    return await dynamoDbClient.update(payloadBody)
  } catch (error) {
    logger.error('Error update URL todo:', error);
    throw new Error('Could not update URL the todo. Please try again later.');
  }
  
}

export { getAll, create, _delete, update, updateUrl } 