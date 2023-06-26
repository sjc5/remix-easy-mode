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
import { getRemFetcherState } from "../common/common-helpers"
import { obj_from_fd, obj_to_fd } from "@kiruna/form-data"
import type { FromPromise } from "@kiruna/promises"

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
  ...initial_props
}: {
  path: string
  schema: InputSchema | null | undefined
  options?: ClientOptions
  serializationHandlers?: SerializationHandlers
} & OnResolveProps<NonNullable<FromPromise<Action>["data"]>>) {
  const fetcher = useFetcher<Action>()
  const fetcher_state = getRemFetcherState(fetcher)

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
      options: Parameters<typeof fn>[0]["input"][k][]
    }
  } = useMemo(() => {
    return Object.fromEntries(
      keys.map((key) => [
        key,
        {
          name: key,
          errors: validationErrors?.issues.filter(
            (issue) => issue.path[0] === key
          ),
          options: (schema?.shape as any)[key]?._def?.options?.map(
            (x: LocalInferred) => x?._def?.value
          ),
        },
      ])
    ) as any
  }, [validationErrors, keys])

  console.log({ fields })

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
      props: { input: LocalInferred } & OnResolveProps<Action> & {
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
        if (process.env.NODE_ENV === "development") {
          console.error("parse error", {
            errors: parsed_input.error,
            attempted_input: props.input,
          })
        }

        setValidationErrors(parsed_input.error)
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
          serializationHandlers?.stringify
        ),
        {
          method: "post",
          action: path,
        }
      )
    },
    [schema, path, fetcher, initial_props, options]
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
          const input = obj_from_fd(
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
    ...fetcher_state,
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
