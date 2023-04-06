import type { DataFunctionArgs } from "@remix-run/node"
import { obj_from_ctx } from "./helpers.server"
import type { AsyncReturnType } from "../common/common-helpers"
import { handle_api_error, handle_api_success } from "./api-responses.server"
import type { ZodSchema } from "zod"

export type BouncerProps = {
  ctx: DataFunctionArgs
  csrf_token: string
}

type Bouncer<SessionType> = (props: BouncerProps) => Promise<SessionType>

const parse_input = async <T>({
  ctx,
  input_schema,
}: {
  ctx: DataFunctionArgs
  input_schema: ZodSchema<T>
}) => {
  const fd = await obj_from_ctx(ctx)

  return {
    parsed_input: input_schema.parse(fd.input),
    csrf_token: (fd.csrf_token as string) || "",
  }
}

const run_bouncer = async <T, B>({
  ctx,
  bouncer,
  csrf_token,
  parsed_input,
}: {
  ctx: DataFunctionArgs
  bouncer: Bouncer<B>
} & AsyncReturnType<typeof parse_input<T>>) => {
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

export const data_function_helper = async <T, U, B>({
  ctx,
  input_schema,
  callback,
  bouncer,
  headers,
  options,
}: {
  ctx: DataFunctionArgs
  input_schema: ZodSchema<T>
  callback: (props: AsyncReturnType<typeof run_bouncer<T, B>>) => Promise<U>
  bouncer: Bouncer<B>
  headers?: Headers
  options?: DataFunctionHelperOptions
}) => {
  const send_raw_errors = options?.send_raw_errors ?? false
  const throw_on_error = options?.throw_on_error ?? false

  try {
    let parse_input_res: AsyncReturnType<typeof parse_input<T>> | undefined
    try {
      parse_input_res = await parse_input({
        ctx,
        input_schema,
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

    let bouncer_res: AsyncReturnType<typeof run_bouncer<T, B>> | undefined
    try {
      bouncer_res = await run_bouncer({
        ctx,
        bouncer,
        ...parse_input_res,
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
