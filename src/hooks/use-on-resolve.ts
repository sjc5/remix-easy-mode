import type { Fetcher } from "@remix-run/react"
import { useEffect, useMemo } from "react"
import {
  handle_api_error,
  handle_api_success,
} from "../server/api-responses.server"
import {
  ResolvedPromise,
  SimpleSerializeFrom,
  get_fetcher_state,
} from "../common/common-helpers"
import { ActionFunction } from "@remix-run/node"

export const useOnResolve = <Data>({
  fetcher,
  on_success,
  on_error,
  on_settled,
}: {
  fetcher: Fetcher
} & OnResolveProps<Data>) => {
  const { is_error, is_success } = get_fetcher_state(fetcher)

  const is_settled = is_error || is_success

  useEffect(() => {
    if (is_success && on_success) {
      on_success(fetcher.data)
    }
    if (is_error && on_error) {
      on_error(fetcher.data)
    }
    if (is_settled && on_settled) {
      on_settled(fetcher.data)
    }
  }, [is_error, is_settled, is_success, on_error, on_settled, on_success])
}

export type OnResolveProps<Data> = {
  on_success?: (data: ResolvedPromise<typeof handle_api_success<Data>>) => void
  on_error?: (data: ResolvedPromise<typeof handle_api_error>) => void
  on_settled?: (
    data:
      | ResolvedPromise<typeof handle_api_success<Data>>
      | ResolvedPromise<typeof handle_api_error>
  ) => void
}
