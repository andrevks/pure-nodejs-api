import { parse } from 'csv-parse'
import { Database } from './database.mjs'
import { jsonMiddleware } from './middlewares/json-middleware.mjs'
import { TaskUseCase } from './use-cases/TaskUseCase.mjs'
import { buildRoutePath } from './utils/build-route-path.mjs'
import busboy from 'busboy'
const database = new Database()
await database.boot()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      await jsonMiddleware(req, res)

      const taskUseCase = new TaskUseCase(database)

      const taskList = await taskUseCase.list()

      res.end(JSON.stringify(taskList))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: async (req, res) => {
      await jsonMiddleware(req, res)

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
      await jsonMiddleware(req, res)

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
      await jsonMiddleware(req, res)

      try {
        const { id } = req.params

        const taskUseCase = new TaskUseCase(database)

        await taskUseCase.deleteById(id)

        return res.writeHead(204).end()
      } catch (error) {
        return res.writeHead(404).end()
      }
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      await jsonMiddleware(req, res)

      try {
        const { id } = req.params

        const taskUseCase = new TaskUseCase(database)

        await taskUseCase.complete(id)

        return res.writeHead(204).end()
      } catch (error) {
        return res.writeHead(404).end()
      }
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/upload-csv'),
    handler: async (req, res) => {
      // Create a new instance of Busboy with the request headers and limits
      const busb = busboy({
        headers: req.headers,
        limits: {
          fileSize: 20 * 1024 * 1024, // Limit file size to 20 MB
          files: 1,
          fields: 1,
          parts: 100
        }
      })

      // Event listener for 'file' event, which is emitted when a file is encountered in the form data
      busb.on('file', async (name, file, info) => {
        // Check if the file is a CSV file
        if (info.mimeType !== 'text/csv') {
          res.writeHead(400).end('Only CSV files are allowed')
          return req.unpipe(busb)
        }

        // Pipe the file stream to a CSV parser
        const parser = file.pipe(parse({ delimiter: ',', from_line: 2 }))

        // Iterate through each record and create a new task
        for await (const record of parser) {
          // Report current line
          const [title, description] = record

          if (!title || !description) {
            return res.writeHead(400).end('title or description have to be sent')
          }

          // Create a new task with the title and description
          const taskUseCase = new TaskUseCase(database)
          await taskUseCase.create({
            title,
            description
          })
        }

        // Send a 201 response when the CSV has been successfully imported
        return res.writeHead(201).end('CSV imported sucessfully')
      })
      // Event listeners which are emitted when the respective limits are exceeded
      busb.on('partsLimit', () => {
        return res.writeHead(400).end('Too many parts')
      })

      busb.on('filesLimit', () => {
        return res.writeHead(400).end('Only one file is allowed')
      })

      busb.on('fieldsLimit', () => {
        return res.writeHead(400).end('Too many fields')
      })

      // Start the flow of data from the request to Busboy.
      // This begins the parsing of the form data.
      // All event listeners on Busboy should be set up before this line.
      req.pipe(busb)
    }
  }
]
