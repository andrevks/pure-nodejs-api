export function buildRoutePath (path) {
  // regex to identify the parms with ":"
  const routeParamsRegex = /:([a-zA-Z]+)/g
  // replace the format found in another regex to identify params dynamically
  // eslint-disable-next-line no-useless-escape
  const pathWithParams = path.replaceAll(routeParamsRegex, '(?<$1>[a-z0-9\-_]+)')
  const pathRegex = new RegExp(`^${pathWithParams}(?<query>\\?(.*))?$`)
  return pathRegex
}
