import type { Fetcher } from "@remix-run/react"
import { useEffect } from "react"
import type {
  handleApiError,
  handleApiSuccess,
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
  onSuccess?: (data: FromPromise<typeof handleApiSuccess<Data>>) => void
  onError?: (data: FromPromise<typeof handleApiError>) => void
  onSettled?: (
    data:
      | FromPromise<typeof handleApiSuccess<Data>>
      | FromPromise<typeof handleApiError>
  ) => void
}
