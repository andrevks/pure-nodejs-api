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

  it('should not update a task by id if the id is not in the db', async () => {
    const taskUseCase = new TaskUseCase(database)
    const oldTask = (await taskUseCase.list({
      title: 'updated task'
    }))[0]

    const nonExistentTask = {
      id: randomUUID(),
      title: 'non existent task',
      description: 'not existent descrition'
    }

    const taskToUpdate = {
      title: 'updated task 2',
      description: 'updated description 2'
    }

    const updatedTask = await taskUseCase.updateById(
      taskToUpdate,
      nonExistentTask.id
    )

    const taskUpdatedArray = await taskUseCase.list({
      title: taskToUpdate.title
    })

    expect(updatedTask).toThrowError()
    expect(oldTask.id).toEqual(taskUpdatedArray[0].id)
    expect(oldTask.title).toEqual(taskUpdatedArray[0].title)
    expect(oldTask.description).toEqual(taskUpdatedArray[0].description)

    expect(taskToUpdate.title).toEqual(taskUpdatedArray[0].title)
    expect(taskToUpdate.description).toEqual(taskUpdatedArray[0].description)

    expect(taskUpdatedArray[0]).toMatchObject(taskToUpdate)
  })

  afterAll(async () => {
    await unlink(databasePath)
  })
})
