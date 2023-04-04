import type { DataFunctionArgs } from "@remix-run/server-runtime"
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

export const data_function_helper = async <T, U, B>({
  ctx,
  input_schema,
  callback,
  bouncer,
  headers,
}: {
  ctx: DataFunctionArgs
  input_schema: ZodSchema<T>
  callback: (props: AsyncReturnType<typeof run_bouncer<T, B>>) => Promise<U>
  bouncer: Bouncer<B>
  headers?: Headers
}) => {
  try {
    let parse_input_res: AsyncReturnType<typeof parse_input<T>> | undefined
    try {
      parse_input_res = await parse_input({
        ctx,
        input_schema,
      })
    } catch (e) {
      return handle_api_error({
        error: e,
        error_message: "Invalid input.",
        response_init: {
          status: 400,
        },
      })
    }

    let bouncer_res: AsyncReturnType<typeof run_bouncer<T, B>> | undefined
    try {
      bouncer_res = await run_bouncer({
        ctx,
        bouncer,
        ...parse_input_res,
      })
    } catch (e) {
      return handle_api_error({
        error: e,
        error_message: "Unauthorized.",
        response_init: {
          status: 401,
        },
      })
    }

    return handle_api_success({
      result: await callback(bouncer_res),
      response_init: {
        headers,
      },
    })
  } catch (e) {
    return handle_api_error({
      error: e,
      error_message: "Something went wrong.",
      response_init: {
        status: 500,
      },
    })
  }
}
