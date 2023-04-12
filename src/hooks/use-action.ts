import type { FetcherWithComponents } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import type { ActionFunction } from "@remix-run/server-runtime"
import { useState, useCallback } from "react"
import type {
  ZodDiscriminatedUnion,
  ZodObject,
  ZodRawShape,
  ZodSchema,
} from "zod"
import { z } from "zod"
import type { OnResolveProps } from "./use-on-resolve"
import { useOnResolve } from "./use-on-resolve"
import { get_rem_fetcher_state } from "../common/common-helpers"
import { obj_to_fd } from "@kiruna/form-data"
import {
  flatten_safe_parse_errors,
  FlattenedSafeParseErrors,
} from "@kiruna/zod"
import type { FromPromise } from "@kiruna/promises"

export type ClientOptions = {
  skip_client_validation?: boolean
}

export function useAction<
  Action extends ActionFunction,
  InputSchema extends ZodSchema
>({
  path,
  input_schema,
  options,
  serialization_handlers,
  ...initial_props
}: {
  path: string
  input_schema: InputSchema | null | undefined
  options?: ClientOptions
  serialization_handlers?: SerializationHandlers
} & OnResolveProps<FromPromise<Action>["data"]>) {
  const fetcher = useFetcher<Action>()
  const { is_loading } = get_rem_fetcher_state(fetcher)

  type Inferred = z.infer<InputSchema>

  const [validation_errors, set_validation_errors] = useState<
    { [P in keyof Inferred]?: string[] | undefined } | undefined
  >(undefined)

  const [on_resolve, set_on_resolve] = useState<
    OnResolveProps<FromPromise<Action>>
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
      props: { input: Inferred } & OnResolveProps<Action> & {
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
        obj_to_fd(
          {
            csrf_token: props.csrf_token,
            input: parsed_input.data,
          },
          serialization_handlers?.stringify
        ),
        {
          method: "post",
          action: path,
        }
      )
    },
    [input_schema, path, fetcher, initial_props, options]
  )

  return {
    is_loading,
    fetcher: fetcher as FetcherWithComponents<Action>,
    result: fetcher.data as FromPromise<Action>,
    run: callback,
    form_props: {
      input_schema,
      set_validation_errors,
      validation_errors,
      options: options ?? {},
      serialization_handlers,
    },
  }
}

type SetValidationErrorsType<Schema extends ZodSchema> = React.Dispatch<
  React.SetStateAction<FlattenedSafeParseErrors<Schema> | undefined>
>

export type FormProps<
  RawShape extends ZodRawShape,
  Inferred extends
    | ZodObject<RawShape>["_output"]
    | ZodDiscriminatedUnion<string, [ZodObject<RawShape>]>["_output"]
> = {
  set_validation_errors: SetValidationErrorsType<ZodSchema<Inferred>>
  input_schema: ZodSchema<Inferred> | null | undefined
  validation_errors: FlattenedSafeParseErrors<ZodSchema<Inferred>> | undefined
  options: ClientOptions
  serialization_handlers?: SerializationHandlers
}

export type SerializationHandlers = {
  stringify: (input: unknown) => string
  parse: (input: string) => unknown
}
