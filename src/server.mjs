import http from 'node:http'
import { routes } from './routes.mjs'
import { extractQueryParams } from './utils/extract-query-params.mjs'
import dotenv from 'dotenv'
dotenv.config()

const server = http.createServer(async (req, res) => {
  const { method, url } = req

  const route = routes.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routeParams = url.match(route.path)
    const { query, ...params } = { ...routeParams.groups }
    req.params = params
    req.query = query ? extractQueryParams(query) : {}

    return route.handler(req, res)
  }

  res.writeHead(404).end()
})

const hostname = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3333
server.listen(port, hostname, () => {
  console.log(`server is listening at http://${hostname}:${port}/`)
})
