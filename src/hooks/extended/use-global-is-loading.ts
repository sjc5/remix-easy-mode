import { useNavigation, useFetchers } from "@remix-run/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import debounce from "just-debounce-it"

type LoadingCallbacks = {
  start: () => void
  done: () => void
}

export const useGlobalLoadingEffect = (props: LoadingCallbacks) => {
  const { state: transition_state } = useNavigation()
  const all_fetchers = useFetchers()

  console.log({
    all_fetchers,
  })

  const is_loading = useMemo(() => {
    return (
      transition_state !== "idle" ||
      all_fetchers.some(
        (fetcher) => fetcher.state !== "idle" && fetcher.type !== "normalLoad"
      )
    )
  }, [transition_state, all_fetchers])

  useDebouncedIsLoading({
    ...props,
    is_loading,
  })
}

const debounce_time = 50

export const useDebouncedIsLoading = ({
  is_loading,
  start,
  done,
}: LoadingCallbacks & {
  is_loading: boolean
}) => {
  const [local_is_loading, set_local_is_loading] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced_start = useCallback(debounce(start, debounce_time, true), [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced_done = useCallback(debounce(done, debounce_time, false), [])

  useEffect(() => {
    if (is_loading && !local_is_loading) {
      set_local_is_loading(true)
    }

    if (!is_loading && local_is_loading) {
      set_local_is_loading(false)
    }
  }, [is_loading, local_is_loading])

  useEffect(() => {
    if (local_is_loading) {
      debounced_start()
    } else {
      debounced_done()
    }

    return () => {
      if (local_is_loading) {
        debounced_done()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local_is_loading])
}
