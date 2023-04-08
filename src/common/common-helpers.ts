import type { Fetcher } from '@remix-run/react'

// export type SimpleSerializeFrom<T extends (...args: any[]) => any | undefined> =
//   Awaited<ReturnType<Awaited<ReturnType<T>>["json"]>>

export const get_rem_fetcher_state = (fetcher: Fetcher) => {
	const is_loading = fetcher.state !== 'idle'

	return {
		is_loading,
		is_success: Boolean(!is_loading && fetcher.data?.success),
		is_error: Boolean(fetcher.data && !fetcher.data?.success),
	}
}
