import type { Fetcher } from "@remix-run/react"
import type { z } from "zod"
import { stringify, parse } from "superjson"
import { ActionFunction, LoaderFunction } from "@remix-run/node"

export type AsyncReturnType<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>

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

  const data = prep_loader_res({
    stringified_res: fetcher.data,
  })

  return {
    is_loading,
    is_success: Boolean(!is_loading && data?.success),
    is_error: Boolean(data && !data?.success),
  }
}

export const prep_loader_res = <A extends ActionFunction | LoaderFunction>({
  stringified_res,
}: {
  stringified_res: string | undefined
}) => {
  return (stringified_res ? parse(stringified_res) : undefined) as
    | AsyncReturnType<A>
    | undefined
}

export const prep_loader_res_throw = <
  LoaderType extends ActionFunction | LoaderFunction
>({
  stringified_res,
}: {
  stringified_res: any
}) => {
  const res = prep_loader_res<LoaderType>({ stringified_res })

  if (!res) {
    throw new Error("Could not parse loader response")
  }

  return res
}
