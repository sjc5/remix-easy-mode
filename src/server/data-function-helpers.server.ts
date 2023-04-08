import type { DataFunctionArgs } from "@remix-run/node"
import { obj_from_ctx } from "./helpers.server"
import { handle_api_error, handle_api_success } from "./api-responses.server"
import type { ZodObject, ZodRawShape, ZodSchema } from "zod"
import { z } from "zod"
import type { FromPromise } from "@kiruna/promises"

export type BouncerProps = {
  ctx: DataFunctionArgs
  csrf_token: string | undefined
}

type NarrowBouncer<SessionType> = (props: BouncerProps) => Promise<SessionType>
type BroadBouncer<SessionType> = NarrowBouncer<SessionType> | null | undefined

type NarrowZodSchema<
  RawShape extends ZodRawShape,
  Schema extends ZodObject<RawShape>["_output"]
> = ZodSchema<Schema>

type BroadZodSchema<
  RawShape extends ZodRawShape,
  Schema extends ZodObject<RawShape>["_output"]
> = NarrowZodSchema<RawShape, Schema> | null | undefined

const parse_input = async <Schema>({
  ctx,
  input_schema,
}: {
  ctx: DataFunctionArgs
  input_schema: ZodSchema<Schema>
}) => {
  const fd = await obj_from_ctx(ctx)

  return {
    parsed_input: input_schema.parse(fd.input),
    csrf_token: (fd.csrf_token as string) || undefined,
  }
}

const run_bouncer = async <Schema, Bouncer>({
  ctx,
  bouncer,
  csrf_token,
  parsed_input,
}: {
  ctx: DataFunctionArgs
  bouncer: NarrowBouncer<Bouncer>
} & FromPromise<typeof parse_input<Schema>>) => {
  const session = await bouncer({
    ctx,
    csrf_token,
  })

  return { session, input: parsed_input }
}

type DataFunctionHelperOptions = {
  send_raw_errors?: boolean
  throw_on_error?: boolean
}

export const data_function_helper = async <
  ZodObjectOutput extends ZodObject<RawShape>["_output"],
  CallbackRes,
  Bouncer,
  RawShape extends ZodRawShape
>({
  ctx,
  input_schema,
  callback,
  bouncer,
  headers,
  options,
}: {
  ctx: DataFunctionArgs
  input_schema: BroadZodSchema<any, ZodObjectOutput>
  callback: (
    props: FromPromise<typeof run_bouncer<ZodObjectOutput, Bouncer>>
  ) => Promise<CallbackRes>
  bouncer: BroadBouncer<Bouncer>
  headers?: Headers
  options?: DataFunctionHelperOptions
}) => {
  const send_raw_errors = options?.send_raw_errors ?? false
  const throw_on_error = options?.throw_on_error ?? false

  try {
    let parse_input_res:
      | FromPromise<typeof parse_input<ZodObjectOutput>>
      | undefined
    try {
      parse_input_res = await parse_input({
        ctx,
        input_schema:
          input_schema ??
          (z.undefined() as unknown as ZodSchema<ZodObjectOutput>),
      })
    } catch (thrown_res) {
      if (thrown_res instanceof Error) {
        if (throw_on_error) {
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
        result: await callback(bouncer_res),
        response_init: {
          headers,
        },
      })
    } catch (thrown_res) {
      if (throw_on_error) {
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
    if (throw_on_error) {
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
