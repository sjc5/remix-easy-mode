import { FetcherWithComponents, useFetcher } from "@remix-run/react"
import type { ActionFunction } from "@remix-run/node"
import { useState, useCallback } from "react"
import type { z, ZodSchema, ZodType } from "zod"
import type { OnResolveProps } from "./use-on-resolve"
import { useOnResolve } from "./use-on-resolve"
import {
  flatten_safe_parse_errors,
  get_fetcher_state,
  obj_to_fd,
  prep_loader_res,
} from "../common/common-helpers"

export type HookOptions = {}

export function useAction<A extends ActionFunction, S>({
  path,
  input_schema,
  options,
  ...initial_props
}: {
  path: string
  input_schema: S extends ZodType ? S : never
} & OnResolveProps<A> & {
    options?: HookOptions
  }) {
  const fetcher = useFetcher<A>()
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

  const typed_fetcher_res = prep_loader_res<A>({
    stringified_res: fetcher.data,
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
        on_success: async (result) => {
          props.on_success?.(result)
          initial_props.on_success?.(result)
        },
        on_error: async (result) => {
          props.on_error?.(result)
          initial_props.on_error?.(result)
        },
        on_settled: async (result) => {
          props.on_settled?.(result)
          initial_props.on_settled?.(result)
        },
      })

      const parsed_input = input_schema.safeParse(props.input)

      if (!parsed_input.success) {
        const errors = flatten_safe_parse_errors(parsed_input)
        set_validation_errors(errors)
        return
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
    fetcher: fetcher as FetcherWithComponents<A>,
    result: typed_fetcher_res,
    run: callback,
    form_props: {
      input_schema,
      set_validation_errors,
      validation_errors,
      options: options ?? {},
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
  options: HookOptions
}
