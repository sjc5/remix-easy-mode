import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { obj_from_ctx } from "./helpers.server"
import { handle_api_error, handle_api_success } from "./api-responses.server"
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

const parse_input = async <Inferred>({
  ctx,
  schema,
  parse_fn,
}: {
  ctx: DataFunctionArgs
  schema: ZodSchema<Inferred>
  parse_fn: ((input: string) => unknown) | undefined
}) => {
  const fd = await obj_from_ctx(ctx, parse_fn)

  return {
    parsed_input: schema.parse(fd.input),
    csrfToken: (fd.csrfToken as string) || undefined,
  }
}

const run_bouncer = async <Inferred, Bouncer>({
  ctx,
  bouncer,
  csrfToken,
  parsed_input,
}: {
  ctx: DataFunctionArgs
  bouncer: NarrowBouncer<Bouncer>
} & FromPromise<typeof parse_input<Inferred>>) => {
  const session = await bouncer({
    ctx,
    csrfToken,
  })

  return { session, input: parsed_input }
}

type DataFunctionHelperOptions = {
  send_raw_errors?: boolean
  throw_onError?: boolean
}

export const dataFunctionHelper = async <
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
  seralizationHandlers,
}: {
  ctx: DataFunctionArgs
  schema: InputSchema | null | undefined
  fn: (
    props: FromPromise<typeof run_bouncer<z.infer<InputSchema>, Bouncer>>
  ) => Promise<FnRes>
  bouncer: BroadBouncer<Bouncer>
  headers?: Headers
  options?: DataFunctionHelperOptions
  seralizationHandlers?: SerializationHandlers
}) => {
  const send_raw_errors = options?.send_raw_errors ?? false
  const throw_onError = options?.throw_onError ?? false

  try {
    let parse_input_res:
      | FromPromise<typeof parse_input<z.infer<InputSchema>>>
      | undefined
    try {
      parse_input_res = await parse_input({
        ctx,
        schema:
          schema ?? (z.any() as unknown as ZodSchema<z.infer<InputSchema>>),
        parse_fn: seralizationHandlers?.parse,
      })
    } catch (thrown_res) {
      if (thrown_res instanceof Error) {
        if (throw_onError) {
          throw thrown_res
        }

        return handle_api_error({
          error: thrown_res,
          error_message: send_raw_errors
            ? thrown_res.message
            : "Invalid input.",
          response_init: {
            status: 400,
          },
        })
      }

      throw thrown_res
    }

    try {
      const bouncer_res = await run_bouncer({
        ctx,
        bouncer: bouncer ?? (() => Promise.resolve(undefined as Bouncer)),
        ...parse_input_res,
      })

      return handle_api_success({
        result: await fn(bouncer_res),
        response_init: {
          headers,
        },
      })
    } catch (thrown_res) {
      if (throw_onError) {
        throw thrown_res
      }

      if (thrown_res instanceof Error) {
        return handle_api_error({
          error: thrown_res,
          error_message: send_raw_errors ? thrown_res.message : "Unauthorized.",
          response_init: {
            status: 401,
          },
        })
      }

      throw thrown_res
    }
  } catch (thrown_res) {
    if (throw_onError) {
      throw thrown_res
    }

    if (thrown_res instanceof Error) {
      return handle_api_error({
        error: thrown_res,
        error_message: send_raw_errors
          ? thrown_res.message
          : "Something went wrong.",
        response_init: {
          status: 500,
        },
      })
    }

    throw thrown_res
  }
}
