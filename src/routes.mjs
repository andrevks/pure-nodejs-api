import { Database } from './database.mjs'

const database = new Database()
await database.boot()

export const routes = [
  {
    method: 'GET',
    path: '/',
    handler: async (req, res) => {
      res.writeHead(200).end('Hello, Andrew')
    }
  }
]
