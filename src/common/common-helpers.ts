import type { Fetcher } from "@remix-run/react"
import { z } from "zod"
import { stringify, parse } from "remix-typedjson"

export type ResolvedPromise<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>

// export type SimpleSerializeFrom<T extends (...args: any[]) => any | undefined> =
//   Awaited<ReturnType<Awaited<ReturnType<T>>["json"]>>

export const flatten_safe_parse_errors = <T>(
  safe_parse_res: z.SafeParseError<T>
) => {
  return safe_parse_res.error.flatten().fieldErrors
}

export const obj_to_fd = (obj: Record<string, any>): FormData => {
  const fd = new FormData()
  for (const key of Object.keys(obj)) {
    fd.append(key, stringify(obj[key]))
  }
  return fd
}

export const obj_from_fd = (fd: FormData): Record<string, any> => {
  const arr = Array.from(fd)
  const obj: Record<string, any> = {}
  for (const [key, value] of arr) {
    try {
      obj[key] = parse(value as string)
    } catch (e) {
      obj[key] = value
    }
  }
  return obj
}

export const get_fetcher_state = (fetcher: Fetcher) => {
  const is_loading = fetcher.state !== "idle"

  return {
    is_loading,
    is_success: Boolean(!is_loading && fetcher.data?.success),
    is_error: Boolean(fetcher.data && !fetcher.data?.success),
  }
}
