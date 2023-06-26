import type { Fetcher } from "@remix-run/react"

function getRemFetcherState(fetcher: Fetcher) {
  const isLoading = fetcher.state !== "idle"

  return {
    isLoading,
    isSuccess: Boolean(!isLoading && fetcher.data?.success),
    isError: Boolean(fetcher.data && !fetcher.data?.success),
  }
}

export { getRemFetcherState }
