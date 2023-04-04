import type { Fetcher } from "@remix-run/react"
import { useEffect } from "react"
import type {
  handle_api_error,
  handle_api_success,
} from "../server/api-responses.server"
import {
  SimpleSerializeFrom,
  get_fetcher_state,
} from "../common/common-helpers"

export const useOnResolve = <U extends (...args: any[]) => any>({
  fetcher,
  on_success,
  on_error,
  on_settled,
}: {
  fetcher: Fetcher
} & OnResolveProps<U>) => {
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
  }, [
    fetcher.data,
    is_error,
    is_settled,
    is_success,
    on_error,
    on_settled,
    on_success,
  ])
}

export type ChildResponse<A extends (...args: any[]) => any> =
  SimpleSerializeFrom<
    typeof handle_api_success<SimpleSerializeFrom<A>>
  >["result"]

export type OnResolveProps<A extends (...args: any[]) => any> = {
  on_success?: (data: ChildResponse<A>) => void
  on_error?: (data: SimpleSerializeFrom<typeof handle_api_error>) => void
  on_settled?: (
    data: ChildResponse<A> | SimpleSerializeFrom<typeof handle_api_error>
  ) => void
}
