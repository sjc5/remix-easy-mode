import type { FetcherWithComponents } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import type { ActionFunction } from "@remix-run/server-runtime"
import { useState, useCallback } from "react"
import type { ZodSchema } from "zod"
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
import { Inferred, NarrowedForForm } from "../unstyled-components/input-helper"

export type ClientOptions = {
  skipClientValidation?: boolean
}

export function useAction<
  Action extends ActionFunction,
  InputSchema extends ZodSchema
>({
  path,
  schema,
  options,
  seralizationHandlers,
  ...initial_props
}: {
  path: string
  schema: InputSchema | null | undefined
  options?: ClientOptions
  seralizationHandlers?: SerializationHandlers
} & OnResolveProps<NonNullable<FromPromise<Action>["data"]>>) {
  const fetcher = useFetcher<Action>()
  const { isLoading } = get_rem_fetcher_state(fetcher)

  type Inferred = z.infer<InputSchema>

  const [validationErrors, setValidationErrors] = useState<
    { [P in keyof Inferred]?: string[] | undefined } | undefined
  >(undefined)

  const [on_resolve, set_on_resolve] = useState<
    OnResolveProps<FromPromise<Action>>
  >({
    onSuccess: initial_props.onSuccess,
    onError: initial_props.onError,
    onSettled: initial_props.onSettled,
  })

  useOnResolve({
    fetcher,
    ...on_resolve,
  })

  const fn = useCallback(
    async (
      props: { input: Inferred } & OnResolveProps<Action> & {
          csrfToken?: string
        } & {
          options?: ClientOptions
        }
    ) => {
      const merged_options = {
        ...options,
        ...props.options,
      }

      set_on_resolve({
        onSuccess: async (result) => {
          props.onSuccess?.(result)
          initial_props.onSuccess?.(result)
        },
        onError: async (result) => {
          props.onError?.(result)
          initial_props.onError?.(result)
        },
        onSettled: async (result) => {
          props.onSettled?.(result)
          initial_props.onSettled?.(result)
        },
      })

      const parsed_input =
        merged_options?.skipClientValidation || !schema
          ? z.any().safeParse(props.input)
          : schema.safeParse(props.input)

      if (!parsed_input.success) {
        const flattened_errors = flatten_safe_parse_errors(parsed_input)

        if (process.env.NODE_ENV === "development") {
          console.error("parse error", {
            errors: flattened_errors,
            attempted_input: props.input,
          })
        }

        setValidationErrors(flattened_errors)
        return
      } else {
        setValidationErrors(undefined)
      }

      fetcher.submit(
        obj_to_fd(
          {
            csrfToken: props.csrfToken,
            input: parsed_input.data,
          },
          seralizationHandlers?.stringify
        ),
        {
          method: "post",
          action: path,
        }
      )
    },
    [schema, path, fetcher, initial_props, options]
  )

  return {
    isLoading,
    fetcher: fetcher as FetcherWithComponents<Action>,
    result: fetcher.data as FromPromise<Action> | undefined,
    submit: fn,
    formProps: {
      schema,
      setValidationErrors,
      validationErrors,
      options: options ?? {},
      seralizationHandlers,
    },
  }
}

type SetValidationErrorsType<Schema extends ZodSchema> = React.Dispatch<
  React.SetStateAction<FlattenedSafeParseErrors<Schema> | undefined>
>

export type FormProps<T> = {
  setValidationErrors: SetValidationErrorsType<ZodSchema<Inferred<T>>>
  schema: T extends NarrowedForForm<T> ? T : never | null | undefined
  validationErrors: FlattenedSafeParseErrors<ZodSchema<Inferred<T>>> | undefined
  options: ClientOptions
  seralizationHandlers?: SerializationHandlers
}

export type SerializationHandlers = {
  stringify: (input: unknown) => string
  parse: (input: string) => unknown
}
