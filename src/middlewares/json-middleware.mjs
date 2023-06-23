export async function jsonMiddleware (req, res) {
  try {
    const chunks = []

    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const requestBody = Buffer.concat(chunks)
    const parsedBody = JSON.parse(requestBody.toString())
    req.body = parsedBody

    console.log(parsedBody)
  } catch (error) {
    req.body = null
  }

  res.setHeader('Content-type', 'application/json')
}
