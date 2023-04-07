import { FetcherWithComponents, useFetcher } from "@remix-run/react"
import type { ActionFunction } from "@remix-run/node"
import { useState, useCallback } from "react"
import { z, ZodSchema, ZodType } from "zod"
import type { OnResolveProps } from "./use-on-resolve"
import { useOnResolve } from "./use-on-resolve"
import {
  ResolvedPromise,
  flatten_safe_parse_errors,
  get_fetcher_state,
  obj_to_fd,
} from "../common/common-helpers"

export type ClientOptions = {
  skip_client_validation?: boolean
}

export function useAction<Action extends ActionFunction, Schema>({
  path,
  input_schema,
  options,
  ...initial_props
}: {
  path: string
  input_schema: Schema extends ZodType ? Schema : null | undefined
} & OnResolveProps<ResolvedPromise<Action>["data"]> & {
    options?: ClientOptions
  }) {
  const fetcher = useFetcher<Action>()
  const { is_loading } = get_fetcher_state(fetcher)

  type SchemaOutput = Schema extends ZodType ? z.infer<Schema> : unknown

  const [validation_errors, set_validation_errors] = useState<
    { [P in allKeys<SchemaOutput>]?: string[] | undefined } | undefined
  >(undefined)

  const [on_resolve, set_on_resolve] = useState<
    OnResolveProps<ResolvedPromise<Action>>
  >({
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
      props: { input: SchemaOutput } & OnResolveProps<Action> & {
          csrf_token?: string
        } & {
          options?: ClientOptions
        }
    ) => {
      const merged_options = {
        ...options,
        ...props.options,
      }

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

      const parsed_input =
        merged_options?.skip_client_validation || !input_schema
          ? z.any().safeParse(props.input)
          : input_schema.safeParse(props.input)

      if (!parsed_input.success) {
        const flattened_errors = flatten_safe_parse_errors(parsed_input)

        if (process.env.NODE_ENV === "development") {
          console.error("parse error", {
            errors: flattened_errors,
            attempted_input: props.input,
          })
        }

        set_validation_errors(flattened_errors)
        return
      } else {
        set_validation_errors(undefined)
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
    is_loading,
    fetcher: fetcher as FetcherWithComponents<Action>,
    result: fetcher.data as ResolvedPromise<Action>,
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
  React.SetStateAction<{ [P in allKeys<T>]?: string[] | undefined } | undefined>
>

type ValidationErrors<T> =
  | { [P in allKeys<T>]?: string[] | undefined }
  | undefined

export type FormProps<Schema> = {
  set_validation_errors: SetValidationErrorsType<Schema>
  input_schema: ZodSchema<Schema> | null | undefined
  validation_errors: ValidationErrors<Schema>
  options: ClientOptions
}
