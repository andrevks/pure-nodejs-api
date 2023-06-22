import http from 'node:http'
import { routes } from './routes.mjs'

const server = http.createServer((req, res) => {
  const { method, url } = req
  console.log(method, url)

  const route = routes.find(route => {
    return route.method === method && route.path === url
  })

  if (route) {
    return res.end(`route "${route.path}" found.`)
  }

  res.writeHead(404).end()
})

const hostname = '127.0.0.1'
const port = 3333

server.listen(port, hostname, () => {
  console.log(`server is listening at http://${hostname}:${port}/`)
})
