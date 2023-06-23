import { Database } from './database.mjs'
import { buildRoutePath } from './utils/build-route-path.mjs'

const database = new Database()
await database.boot()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/'),
    handler: async (req, res) => {
      res.writeHead(200).end('Hello, Andrew')
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/users'),
    handler: async (req, res) => {
      res.writeHead(200).end('Hello, Andrew')
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/users'),
    handler: async (req, res) => {
      res.writeHead(200).end('Hello, Andrew')
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/users/:id'),
    handler: async (req, res) => {
      res.writeHead(200).end('Hello, Andrew')
    }
  }
]
