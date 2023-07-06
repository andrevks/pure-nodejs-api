import { Database } from './database.mjs'
import { TaskUseCase } from './use-cases/TaskUseCase.mjs'
import { buildRoutePath } from './utils/build-route-path.mjs'
const database = new Database()
await database.boot()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      const taskUseCase = new TaskUseCase(database)

      const taskList = await taskUseCase.list()

      res.end(JSON.stringify(taskList))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      const {
        title,
        description
      } = req.body

      if (!title || !description) {
        return res.writeHead(400).end('title or description have to be sent')
      }

      const taskUseCase = new TaskUseCase(database)

      await taskUseCase.create({
        title,
        description
      })

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      try {
        const { id } = req.params
        const {
          title,
          description
        } = req.body

        if (!title && !description) {
          return res.writeHead(400).end('title or description have to be sent')
        }

        const taskUseCase = new TaskUseCase(database)

        await taskUseCase.updateById({
          title,
          description
        }, id)

        return res.writeHead(204).end()
      } catch (error) {
        return res.writeHead(404).end()
      }
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      try {
        const { id } = req.params

        const taskUseCase = new TaskUseCase(database)

        await taskUseCase.deleteById(id)

        return res.writeHead(204).end()
      } catch (error) {
        return res.writeHead(404).end()
      }
    }
  }, {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      try {
        const { id } = req.params

        const taskUseCase = new TaskUseCase(database)

        await taskUseCase.complete(id)

        return res.writeHead(204).end()
      } catch (error) {
        return res.writeHead(404).end()
      }
    }
  }
]
