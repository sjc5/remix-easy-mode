import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { objFromCtx } from "./helpers.server"
import { handleApiError, handleApiSuccess } from "./api-responses.server"
import type { ZodSchema } from "zod"
import { z } from "zod"
import type { FromPromise } from "@kiruna/promises"
import { SerializationHandlers } from "../hooks/use-action"

export type BouncerProps = {
  ctx: DataFunctionArgs
  csrfToken: string | undefined
}

type NarrowBouncer<SessionType> = (props: BouncerProps) => Promise<SessionType>
type BroadBouncer<SessionType> = NarrowBouncer<SessionType> | null | undefined

const parseInput = async <Inferred>({
  ctx,
  schema,
  parseFn,
}: {
  ctx: DataFunctionArgs
  schema: ZodSchema<Inferred>
  parseFn: ((input: string) => unknown) | undefined
}) => {
  const obj = await objFromCtx(ctx, parseFn)

  return {
    parsedInput: schema.parse(obj.input),
    csrfToken: (obj.csrfToken as string) || undefined,
  }
}

const runBouncer = async <Inferred, Bouncer>({
  ctx,
  bouncer,
  csrfToken,
  parsedInput,
}: {
  ctx: DataFunctionArgs
  bouncer: NarrowBouncer<Bouncer>
} & FromPromise<typeof parseInput<Inferred>>) => {
  const session = await bouncer({
    ctx,
    csrfToken,
  })

  return { session, input: parsedInput }
}

type DataFunctionHelperOptions = {
  sendRawErrors?: boolean
  throwOnError?: boolean
}

async function dataFunctionHelper<
  InputSchema extends ZodSchema,
  FnRes,
  Bouncer
>({
  ctx,
  schema,
  fn,
  bouncer,
  headers,
  options,
  serializationHandlers,
}: {
  ctx: DataFunctionArgs
  schema: InputSchema | null | undefined
  fn: (
    props: FromPromise<typeof runBouncer<z.infer<InputSchema>, Bouncer>>
  ) => Promise<FnRes>
  bouncer: BroadBouncer<Bouncer>
  headers?: Headers
  options?: DataFunctionHelperOptions
  serializationHandlers?: SerializationHandlers
}) {
  const sendRawErrors = options?.sendRawErrors ?? false
  const throwOnError = options?.throwOnError ?? false

  try {
    let parseInputRes:
      | FromPromise<typeof parseInput<z.infer<InputSchema>>>
      | undefined
    try {
      parseInputRes = await parseInput({
        ctx,
        schema:
          schema ?? (z.any() as unknown as ZodSchema<z.infer<InputSchema>>),
        parseFn: serializationHandlers?.parse,
      })
    } catch (thrownRes) {
      if (thrownRes instanceof Error) {
        if (throwOnError) {
          throw thrownRes
        }

        return handleApiError({
          error: thrownRes,
          errorMessage: sendRawErrors ? thrownRes.message : "Invalid input.",
          responseInit: {
            status: 400,
          },
        })
      }

      throw thrownRes
    }

    try {
      const bouncerRes = await runBouncer({
        ctx,
        bouncer: bouncer ?? (() => Promise.resolve(undefined as Bouncer)),
        ...parseInputRes,
      })

      return handleApiSuccess({
        result: await fn(bouncerRes),
        responseInit: {
          headers,
        },
      })
    } catch (thrownRes) {
      if (throwOnError) {
        throw thrownRes
      }

      if (thrownRes instanceof Error) {
        return handleApiError({
          error: thrownRes,
          errorMessage: sendRawErrors ? thrownRes.message : "Unauthorized.",
          responseInit: {
            status: 401,
          },
        })
      }

      throw thrownRes
    }
  } catch (thrownRes) {
    if (throwOnError) {
      throw thrownRes
    }

    if (thrownRes instanceof Error) {
      return handleApiError({
        error: thrownRes,
        errorMessage: sendRawErrors
          ? thrownRes.message
          : "Something went wrong.",
        responseInit: {
          status: 500,
        },
      })
    }

    throw thrownRes
  }
}

export { dataFunctionHelper }
