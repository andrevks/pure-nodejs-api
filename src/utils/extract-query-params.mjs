export function extractQueryParams (query) {
  return query.substring(1).split('&').reduce((queryParams, item) => {
    const [key, value] = item.split('=')

    queryParams[key] = value

    return queryParams
  }, {})
}
