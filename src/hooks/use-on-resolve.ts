import type { Fetcher } from "@remix-run/react"
import { useEffect } from "react"
import type {
  handle_api_error,
  handle_api_success,
} from "../server/api-responses.server"
import { get_rem_fetcher_state } from "../common/common-helpers"
import type { FromPromise } from "@kiruna/promises"

export const useOnResolve = <Data>({
  fetcher,
  onSuccess,
  onError,
  onSettled,
}: {
  fetcher: Fetcher
} & OnResolveProps<Data>) => {
  const { is_error, is_success } = get_rem_fetcher_state(fetcher)

  const is_settled = is_error || is_success

  useEffect(() => {
    if (is_success && onSuccess) {
      onSuccess(fetcher.data)
    }
    if (is_error && onError) {
      onError(fetcher.data)
    }
    if (is_settled && onSettled) {
      onSettled(fetcher.data)
    }
  }, [
    fetcher.data,
    is_error,
    is_settled,
    is_success,
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
