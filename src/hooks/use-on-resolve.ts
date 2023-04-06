import type { Fetcher } from "@remix-run/react"
import { useEffect } from "react"
import {
  handle_api_error,
  handle_api_success,
} from "../server/api-responses.server"
import {
  SimpleSerializeFrom,
  get_fetcher_state,
} from "../common/common-helpers"
import { parse } from "superjson"

export const useOnResolve = <A extends (...args: any[]) => any>({
  fetcher,
  on_success,
  on_error,
  on_settled,
}: {
  fetcher: Fetcher
} & OnResolveProps<A>) => {
  type Result = SimpleSerializeFrom<
    typeof handle_api_success<A> | typeof handle_api_error
  >

  const { is_error, is_success, is_loading } = get_fetcher_state(fetcher)

  const is_settled = is_error || is_success

  const typed_fetcher_res = fetcher.data
    ? (parse(fetcher.data) as Result)
    : undefined

  useEffect(() => {
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

export type OnResolveProps<A extends (...args: any[]) => any> = {
  on_success?: (
    data: SimpleSerializeFrom<
      typeof handle_api_success<A> | typeof handle_api_error
    >
  ) => void
  on_error?: (
    data: SimpleSerializeFrom<
      typeof handle_api_success<A> | typeof handle_api_error
    >
  ) => void
  on_settled?: (
    data: SimpleSerializeFrom<
      typeof handle_api_success<A> | typeof handle_api_error
    >
  ) => void
}
