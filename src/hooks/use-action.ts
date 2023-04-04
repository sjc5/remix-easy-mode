import { FetcherWithComponents, useFetcher } from "@remix-run/react"
import { useState, useCallback } from "react"
import type { z, ZodSchema, ZodType } from "zod"
import type { ChildResponse, OnResolveProps } from "./use-on-resolve"
import { useOnResolve } from "./use-on-resolve"
import {
  get_fetcher_state,
  flatten_safe_parse_errors,
  obj_to_fd,
} from "../common/common-helpers"

export function useAction<A extends (...args: any[]) => any, S>({
  path,
  input_schema,
  ...initial_props
}: {
  path: string
  input_schema: S extends ZodType ? S : never
} & OnResolveProps<A>) {
  const fetcher = useFetcher<ChildResponse<A>>()
  const fetcher_state = get_fetcher_state(fetcher)

  type InputSchema = z.infer<typeof input_schema>

  const [validation_errors, set_validation_errors] = useState<
    { [P in allKeys<InputSchema>]?: string[] | undefined } | null
  >(null)

  const [on_resolve, set_on_resolve] = useState<OnResolveProps<A>>({
    on_success: initial_props.on_success,
    on_error: initial_props.on_error,
    on_settled: initial_props.on_settled,
  })

  useOnResolve({
    fetcher,
    ...on_resolve,
  })

  const callback = useCallback(
    async (
      props: { input: InputSchema } & OnResolveProps<A> & {
          csrf_token: string
        }
    ) => {
      set_on_resolve({
        on_success: async (data) => {
          props.on_success?.(data)
          initial_props.on_success?.(data)
        },
        on_error: async (data) => {
          props.on_error?.(data)
          initial_props.on_error?.(data)
        },
        on_settled: async (data) => {
          props.on_settled?.(data)
          initial_props.on_settled?.(data)
        },
      })

      const parsed_input = input_schema.safeParse(props.input)

      if (!parsed_input.success) {
        const errors = flatten_safe_parse_errors(parsed_input)
        return set_validation_errors(errors)
      } else {
        set_validation_errors(null)
      }

      fetcher.submit(
        obj_to_fd({
          ...props,
          input: parsed_input.data,
        }),
        {
          method: "post",
          action: path,
        }
      )
    },
    [input_schema, path, fetcher, initial_props]
  )

  return {
    ...fetcher_state,
    fetcher: fetcher as FetcherWithComponents<ChildResponse<A>>,
    run: callback,
    form_props: {
      input_schema,
      set_validation_errors,
      validation_errors,
    },
  }
}

type allKeys<V> = V extends any ? keyof V : never

type SetValidationErrorsType<T> = React.Dispatch<
  React.SetStateAction<{ [P in allKeys<T>]?: string[] | undefined } | null>
>

type ValidationErrors<T> = { [P in allKeys<T>]?: string[] | undefined } | null

export type FormProps<T> = {
  set_validation_errors: SetValidationErrorsType<T>
  input_schema: ZodSchema<T>
  validation_errors: ValidationErrors<T>
}
