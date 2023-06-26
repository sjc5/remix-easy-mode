import type { FetcherWithComponents } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import type { ActionFunction } from "@remix-run/server-runtime"
import { useState, useCallback, useMemo } from "react"
import type { SomeZodObject, ZodError, ZodIssue, ZodTypeDef } from "zod"
import { z } from "zod"
import type { OnResolveProps } from "./use-on-resolve"
import { useOnResolve } from "./use-on-resolve"
import { getRemFetcherState } from "../utils/get-rem-fetcher-state"
import {
  obj_from_fd as objectFromFormData,
  obj_to_fd as objectToFormData,
} from "@kiruna/form-data"
import type { FromPromise } from "@kiruna/promises"
import { optionsFromZodShapeDef } from "../utils/options-from-zod-shape-def"

export type ClientOptions = {
  skipClientValidation?: boolean
}

export function useAction<
  Action extends ActionFunction,
  InputSchema extends SomeZodObject
>({
  path,
  schema,
  options,
  serializationHandlers,
  ...initialProps
}: {
  path: string
  schema: InputSchema | null | undefined
  options?: ClientOptions
  serializationHandlers?: SerializationHandlers
} & OnResolveProps<NonNullable<FromPromise<Action>["data"]>>) {
  const fetcher = useFetcher<Action>()
  const fetcherState = getRemFetcherState(fetcher)

  type LocalInferred = z.infer<InputSchema>
  type Keys = keyof LocalInferred

  const keys = Object.keys(schema?.shape ?? {}) as Keys[]

  const [validationErrors, setValidationErrors] = useState<
    ZodError<LocalInferred> | undefined
  >(undefined)

  const fields: {
    [k in Keys]: {
      errors: ZodIssue[] | undefined
      options: Parameters<typeof mutate>[0]["input"][k][] | undefined
      inputProps: {
        schema: typeof schema
        stringifyFn: SerializationHandlers["stringify"] | undefined
        name: k
      }
    }
  } = useMemo(() => {
    return Object.fromEntries(
      keys.map((key) => {
        const shapeDef = (schema?.shape as any)?.[key]?._def as
          | ZodTypeDef
          | undefined

        return [
          key,
          {
            errors: validationErrors?.issues.filter(
              (issue) => issue.path[0] === key
            ),
            options: optionsFromZodShapeDef(shapeDef),
            inputProps: {
              schema,
              stringifyFn: serializationHandlers?.stringify,
              name: key,
            },
          },
        ]
      })
    ) as any
  }, [validationErrors, keys])

  const [onResolve, setOnResolve] = useState<
    OnResolveProps<NonNullable<FromPromise<Action>["data"]>>
  >({
    onSuccess: initialProps.onSuccess,
    onError: initialProps.onError,
    onSettled: initialProps.onSettled,
  })

  useOnResolve({
    fetcher,
    ...onResolve,
  })

  const mutate = useCallback(
    async (
      props: { input: LocalInferred } & OnResolveProps<
        NonNullable<FromPromise<Action>["data"]>
      > & {
          csrfToken?: string
        } & {
          options?: ClientOptions
        }
    ) => {
      const mergedOptions = {
        ...options,
        ...props.options,
      }

      setOnResolve({
        onSuccess: async (result) => {
          props.onSuccess?.(result)
          initialProps.onSuccess?.(result)
        },
        onError: async (result) => {
          props.onError?.(result)
          initialProps.onError?.(result)
        },
        onSettled: async (result) => {
          props.onSettled?.(result)
          initialProps.onSettled?.(result)
        },
      })

      const parsedInput =
        mergedOptions?.skipClientValidation || !schema
          ? z.any().safeParse(props.input)
          : schema.safeParse(props.input)

      if (!parsedInput.success) {
        if (process.env.NODE_ENV === "development") {
          console.error("parse error", {
            errors: parsedInput.error,
            attemptedInput: props.input,
          })
        }

        setValidationErrors(parsedInput.error)
        return
      } else {
        setValidationErrors(undefined)
      }

      fetcher.submit(
        objectToFormData(
          {
            csrfToken: props.csrfToken,
            input: parsedInput.data,
          },
          serializationHandlers?.stringify
        ),
        {
          method: "post",
          action: path,
        }
      )
    },
    [schema, path, fetcher, initialProps, options]
  )

  const Form = useMemo(() => {
    return function Form({
      onSubmit,
      ...props
    }: {
      onSubmit: ({
        input,
        e,
      }: {
        input: LocalInferred
        e: React.FormEvent<HTMLFormElement>
      }) => void
    } & Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault()

            const fd = new FormData(e.target as HTMLFormElement)
            const input = objectFromFormData(
              fd,
              serializationHandlers?.parse
            ) as LocalInferred

            onSubmit({
              input,
              e,
            })
          }}
          {...props}
        >
          {props.children}
        </form>
      )
    }
  }, [])

  return {
    ...fetcherState,
    fetcher: fetcher as FetcherWithComponents<Action>,
    result: fetcher.data as FromPromise<Action> | undefined,
    mutate,
    Form,
    fields,
  }
}

export type SerializationHandlers = {
  stringify: (input: unknown) => string
  parse: (input: string) => unknown
}
