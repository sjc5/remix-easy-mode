import { useMatches } from "@remix-run/react"

export const useRouteData = <LoaderData>(
  route_pathname: string
): LoaderData => {
  const matches = useMatches()
  const data = matches.find((match) => match.pathname === route_pathname)?.data
  return data as LoaderData
}
