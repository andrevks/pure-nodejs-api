import { Database } from '../database.mjs'
import { randomUUID } from 'node:crypto'

export class TaskUseCase {
  #database = Database
  #table = 'tasks'

  constructor (database) {
    this.#database = database
  }

  async create (task) {
    const { title, description } = task

    await this.#database.boot()

    const newTask = {
      id: randomUUID(),
      title,
      description,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date()
    }

    await this.#database.insert(this.#table, newTask)

    return newTask
  }

  async list (searchParams) {
    const params = this.#getOnlyDefinedParams(searchParams)
    await this.#database.boot()

    const listedTaks = this.#database.select(this.#table, params)

    return listedTaks
  }

  async updateById (newTask, id) {
    await this.#database.boot()

    const { title, description } = newTask
    const isTaskOnDb = await this.#getFirstByIdOrFail(id)
    await this.#database.update(this.#table, id, {
      ...isTaskOnDb,
      title: title || isTaskOnDb.title,
      description: description || isTaskOnDb.description,
      updated_at: new Date()
    })

    return isTaskOnDb
  }

  async deleteById (id) {
    await this.#database.boot()

    const isTaskOnDb = await this.#getFirstByIdOrFail(id)

    await this.#database.delete(this.#table, id)

    return isTaskOnDb
  }

  #getOnlyDefinedParams (searchParams) {
    return Object.entries(searchParams || {})
      .reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})
  }

  #getFirstByIdOrFail (id) {
    const listOfTasks = this.#database.select(this.#table, { id })
    if (listOfTasks.length <= 0) {
      throw new Error('Task not found')
    }
    return listOfTasks[0]
  }
}
