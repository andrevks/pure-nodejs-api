import { randomUUID } from 'node:crypto'
import { Database } from './database.mjs'
import { buildRoutePath } from './utils/build-route-path.mjs'
const database = new Database()
await database.boot()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/users'),
    handler: async (req, res) => {
      const { search } = req.query

      const searchParams = search
        ? {
            name: search,
            email: search
          }
        : null

      const users = database.select('users', searchParams)

      return res.end(JSON.stringify(users))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/users'),
    handler: async (req, res) => {
      const { name, email } = req.body
      const id = randomUUID()
      const user = { id, name, email }

      await database.insert('users', user)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/users/:id'),
    handler: async (req, res) => {
      const { id } = req.params
      const { name, email } = req.body

      await database.update('users', id, {
        name,
        email
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/users/:id'),
    handler: async (req, res) => {
      const { id } = req.params

      await database.delete('users', id)

      return res.writeHead(204).end()
    }
  }
]
