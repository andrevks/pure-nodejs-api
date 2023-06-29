import { afterAll, describe, expect, it } from 'vitest'
import { unlink } from 'node:fs/promises'
import { TaskUseCase } from '../src/use-cases/TaskUseCase.mjs'
import { Database } from '../src/database.mjs'
import { randomUUID } from 'node:crypto'
/*
  id - Unique identifier for each task
  title - Title of the task
  description - Detailed description of the task
  completed_at - Date when the task was completed. The initial value should be null.
  created_at - Date when the task was created.
  updated_at - Should always be updated to the date when the task was last updated.
*/

const setupDatabase = async () => {
  const databasePath = new URL('../db-task-test.json', import.meta.url)
  const database = new Database(databasePath)
  await database.boot()

  const newTask = {
    title: 'new task',
    description: 'a task description'
  }
  const otherTask = {
    title: 'other one',
    description: 'some description'
  }

  return { database, databasePath, newTask, otherTask }
}
const { database, databasePath, newTask, otherTask } = await setupDatabase()

describe('tasks resource', async () => {
  it('should create a task', async () => {
    // It should be possible to create a task in the database by sending the title and description fields through the request body.
    // When creating a task, the fields id, created_at, updated_at, and completed_at should be automatically filled, according to the guidance of the properties above.

    const taskUseCase = new TaskUseCase(database)
    const sut = await taskUseCase.create(newTask)

    // assert the returned task matches the inputed task
    expect(sut).toMatchObject(newTask)
    expect(sut).toBeDefined()
    expect(sut.title).toBe(newTask.title)
    expect(sut.description).toBe(newTask.description)

    // Assert that the automatically filled fields are correct
    expect(sut.id).toBeDefined()
    expect(sut.created_at).toBeInstanceOf(Date)
    expect(sut.updated_at).toBeInstanceOf(Date)
    expect(sut.completed_at).toBeNull()

    await taskUseCase.create(otherTask)
  })

  it('should list tasks without filter', async () => {
    const taskUseCase = new TaskUseCase(database)
    const sut = await taskUseCase.list()
    expect(sut).toBeDefined()
    expect(sut[0]).toEqual(
      expect.objectContaining(newTask)
    )
    expect(sut).toEqual(
      expect.arrayContaining([
        expect.objectContaining(newTask)
      ]
      ))
  })

  it('should list tasks with filter', async () => {
    const search = 'task'
    const searchParams = {
      title: search,
      description: search
    }

    const taskUseCase = new TaskUseCase(database)
    const sut = await taskUseCase.list(searchParams)
    expect(sut).toBeDefined()
    expect(sut[0]).toEqual(
      expect.objectContaining(newTask)
    )
    expect(sut[0]).not.toEqual(
      expect.objectContaining(otherTask)
    )
  })

  it('should update a task by id', async () => {
    const taskUseCase = new TaskUseCase(database)
    const oldTaskArray = await taskUseCase.list({
      title: 'new task'
    })

    const taskToUpdate = {
      title: 'updated task',
      description: 'updated description'
    }

    await taskUseCase.updateById(
      taskToUpdate,
      oldTaskArray[0].id
    )

    const taskUpdatedArray = await taskUseCase.list({
      title: taskToUpdate.title
    })

    expect(oldTaskArray[0].id).toEqual(taskUpdatedArray[0].id)
    expect(oldTaskArray[0].title).not.toEqual(taskUpdatedArray[0].title)
    expect(oldTaskArray[0].description).not.toEqual(taskUpdatedArray[0].description)

    expect(taskToUpdate.title).toEqual(taskUpdatedArray[0].title)
    expect(taskToUpdate.description).toEqual(taskUpdatedArray[0].description)

    expect(taskUpdatedArray[0]).toMatchObject(taskToUpdate)
  })

  it('should update one if only TITLE is sent, it means that description cannot be updated',
    async () => {
    // Arrange
      const taskUseCase = new TaskUseCase(database)

      // Retrieve the old task with a specific title from the database
      const oldTask = (await taskUseCase.list({
        title: 'updated task'
      }))[0]

      const updatedTitle = 'task To Update With Title'

      const taskToUpdate = {
        title: updatedTitle
      }

      // Act
      await taskUseCase.updateById(taskToUpdate, oldTask.id)

      // Retrieve the updated task with the new title from the database
      const updatedTask = await taskUseCase.list({
        title: updatedTitle
      })

      // Assert
      expect(oldTask.id).toEqual(updatedTask[0].id)
      expect(oldTask.title).not.toEqual(updatedTask[0].title)
      expect(oldTask.description).toEqual(updatedTask[0].description)

      // Ensure that the title is updated correctly
      expect(taskToUpdate.title).toEqual(updatedTask[0].title)

      // Create the expected task with updated properties
      const expectedTask = {
        ...oldTask,
        title: taskToUpdate.title,
        updated_at: updatedTask[0].updated_at // Set the updated_at property to match the received object
      }

      // Verify that the updated task matches the expected task
      expect(expectedTask).toMatchObject(updatedTask[0])
    })

  it('should update one if only DESCRIPTION is sent, it means that title cannot be updated',
    async () => {
      // Arrange
      const taskUseCase = new TaskUseCase(database)

      const newTask = {
        title: 'task to not alter description',
        description: 'description to be altered'
      }

      // Create a new task to be updated
      await taskUseCase.create(newTask)

      // Retrieve the old task from the database
      const oldTask = (await taskUseCase.list({
        title: newTask.title
      }))[0]

      const updatedDescription = 'task with new description'

      const taskToUpdate = {
        description: updatedDescription
      }

      // Act
      await taskUseCase.updateById(taskToUpdate, oldTask.id)

      // Retrieve the updated task from the database
      const updatedTask = (await taskUseCase.list({
        description: updatedDescription
      }))[0]

      // Assert
      expect(oldTask.id).toEqual(updatedTask.id)
      expect(oldTask.title).toEqual(updatedTask.title)
      expect(oldTask.description).not.toEqual(updatedTask.description)

      // Ensure that the description is updated correctly
      expect(taskToUpdate.description).toEqual(updatedTask.description)

      // Create the expected task with updated properties
      const expectedTask = {
        ...oldTask,
        description: taskToUpdate.description,
        updated_at: updatedTask.updated_at // Set the updated_at property to match the received object
      }

      // Verify that the updated task matches the expected task
      expect(expectedTask).toMatchObject(updatedTask)
    })

  afterAll(async () => {
    await unlink(databasePath)
  })
})
