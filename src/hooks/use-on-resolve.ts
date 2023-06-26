import type { Fetcher } from "@remix-run/react"
import { useEffect } from "react"
import type {
  handle_api_error,
  handle_api_success,
} from "../server/api-responses.server"
import { getRemFetcherState } from "../common/common-helpers"
import type { FromPromise } from "@kiruna/promises"

export const useOnResolve = <Data>({
  fetcher,
  onSuccess,
  onError,
  onSettled,
}: {
  fetcher: Fetcher
} & OnResolveProps<Data>) => {
  const { isError, isSuccess } = getRemFetcherState(fetcher)

  const isSettled = isError || isSuccess

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess(fetcher.data)
    }
    if (isError && onError) {
      onError(fetcher.data)
    }
    if (isSettled && onSettled) {
      onSettled(fetcher.data)
    }
  }, [
    fetcher.data,
    isError,
    isSettled,
    isSuccess,
    onError,
    onSettled,
    onSuccess,
  ])
}

export type OnResolveProps<Data> = {
  onSuccess?: (data: FromPromise<typeof handle_api_success<Data>>) => void
  onError?: (data: FromPromise<typeof handle_api_error>) => void
  onSettled?: (
    data:
      | FromPromise<typeof handle_api_success<Data>>
      | FromPromise<typeof handle_api_error>
  ) => void
}
