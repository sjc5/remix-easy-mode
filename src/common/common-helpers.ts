import type { Fetcher } from "@remix-run/react"

// export type SimpleSerializeFrom<T extends (...args: any[]) => any | undefined> =
//   Awaited<ReturnType<Awaited<ReturnType<T>>["json"]>>

export const get_rem_fetcher_state = (fetcher: Fetcher) => {
  const isLoading = fetcher.state !== "idle"

  return {
    isLoading,
    is_success: Boolean(!isLoading && fetcher.data?.success),
    is_error: Boolean(fetcher.data && !fetcher.data?.success),
  }
}
