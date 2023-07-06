import http from 'node:http'
import { routes } from './routes.mjs'
import { jsonMiddleware } from './middlewares/json-middleware.mjs'
import { extractQueryParams } from './utils/extract-query-params.mjs'

const server = http.createServer(async (req, res) => {
  const { method, url } = req

  await jsonMiddleware(req, res)

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

const hostname = '127.0.0.1'
const port = 3333

server.listen(port, hostname, () => {
  console.log(`server is listening at http://${hostname}:${port}/`)
})
