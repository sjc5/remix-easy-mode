import type { Fetcher } from "@remix-run/react"
import { useEffect } from "react"
import {
  handle_api_error,
  handle_api_success,
} from "../server/api-responses.server"
import {
  AsyncReturnType,
  get_fetcher_state,
  prep_loader_res,
} from "../common/common-helpers"
import { ActionFunction } from "@remix-run/node"

export const useOnResolve = <A extends ActionFunction>({
  fetcher,
  on_success,
  on_error,
  on_settled,
}: {
  fetcher: Fetcher
} & OnResolveProps<A>) => {
  const { is_error, is_success } = get_fetcher_state(fetcher)

  const is_settled = is_error || is_success

  const typed_fetcher_res = prep_loader_res<A>({
    stringified_res: fetcher.data,
  })

  useEffect(() => {
    if (!typed_fetcher_res) return

    if (is_success && on_success) {
      on_success(typed_fetcher_res)
    }
    if (is_error && on_error) {
      on_error(typed_fetcher_res)
    }
    if (is_settled && on_settled) {
      on_settled(typed_fetcher_res)
    }
  }, [is_error, is_settled, is_success, on_error, on_settled, on_success])
}

export type OnResolveProps<A extends ActionFunction> = {
  on_success?: (
    data: AsyncReturnType<typeof handle_api_success<AsyncReturnType<A>["data"]>>
  ) => void
  on_error?: (data: AsyncReturnType<typeof handle_api_error>) => void
  on_settled?: (
    data:
      | AsyncReturnType<typeof handle_api_success<AsyncReturnType<A>["data"]>>
      | AsyncReturnType<typeof handle_api_error>
  ) => void
}
