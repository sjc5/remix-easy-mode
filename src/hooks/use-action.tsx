import type { FetcherWithComponents } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import type { ActionFunction } from "@remix-run/server-runtime"
import { useState, useCallback, useMemo } from "react"
import type {
  SomeZodObject,
  ZodError,
  ZodIssue,
  ZodObject,
  ZodRawShape,
} from "zod"
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
  type Keys = keyof LocalInferred | "csrfToken"

  const keys = Object.keys({
    ...(schema?.shape ?? {}),
    csrfToken: "",
  }) as Keys[]

  const [validationErrors, setValidationErrors] = useState<
    ZodError<LocalInferred> | undefined
  >(undefined)

  const fields: {
    [k in Keys]: {
      name: k
      errors: ZodIssue[] | undefined
      options: Parameters<typeof fn>[0]["input"][k][] | undefined
    }
  } = useMemo(() => {
    return Object.fromEntries(
      keys.map((key) => {
        const shapeDef = (schema?.shape as any)[key]?._def

        return [
          key,
          {
            name: key,
            errors: validationErrors?.issues.filter(
              (issue) => issue.path[0] === key
            ),
            options: optionsFromZodShapeDef(shapeDef),
          },
        ]
      })
    ) as any
  }, [validationErrors, keys])

  console.log({ fields })

  const [onResolve, setOnResolve] = useState<
    OnResolveProps<FromPromise<Action>>
  >({
    onSuccess: initialProps.onSuccess,
    onError: initialProps.onError,
    onSettled: initialProps.onSettled,
  })

  useOnResolve({
    fetcher,
    ...onResolve,
  })

  const fn = useCallback(
    async (
      props: { input: LocalInferred } & OnResolveProps<Action> & {
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

  const formProps = useMemo(() => {
    return {
      schema,
      setValidationErrors,
      validationErrors,
      options: options ?? {},
      serializationHandlers,
    }
  }, [])

  const Form = useCallback(function Form<T>({
    onSubmit,
    ...props
  }: {
    onSubmit: ({
      input,
      e,
    }: {
      input: Inferred<T>
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
            formProps.serializationHandlers?.parse
          ) as Inferred<T>

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
  }, [])

  return {
    ...fetcherState,
    fetcher: fetcher as FetcherWithComponents<Action>,
    result: fetcher.data as FromPromise<Action> | undefined,
    submit: fn,
    Form,
    stringify: serializationHandlers?.stringify,
    fields,
  }
}

export type SerializationHandlers = {
  stringify: (input: unknown) => string
  parse: (input: string) => unknown
}

type ZodObjectFromRawShape<RS extends ZodRawShape> = ZodObject<RS>

type NarrowedForForm<T> = T extends ZodObject<infer RS>
  ? ZodObjectFromRawShape<RS>
  : never

type Inferred<T> = NarrowedForForm<T>["_output"]
