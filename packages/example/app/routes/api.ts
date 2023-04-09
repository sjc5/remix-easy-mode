import type { DataFunctionArgs } from "@remix-run/node"
import { z } from "zod"
import { data_function_helper, useAction } from "../../../../index"
import { bouncer } from "../bouncer"
import { stringify, parse } from "superjson"

export const REQUIRED_INPUT_STRING = "hello world"

const input_schema = z.object({
  some_user_input: z.string().refine((val) => val !== "bad message", {
    message: `Oops, you weren't supposed to write that!`,
  }),
})

const serialization_handlers = {
  stringify,
  parse,
}

export const action = (ctx: DataFunctionArgs) => {
  return data_function_helper({
    ctx,
    input_schema,
    bouncer,
    callback: async ({ input, session }) => {
      const status_text = session.user
        ? `logged in as user ${session.user.id}`
        : "not logged in"

      return {
        message:
          `You are ${status_text}. You typed: ${input.some_user_input}.` as const,
        at: new Date(),
      }
    },
    serialization_handlers,
  })
}

export const useExampleHook = () => {
  return useAction<typeof action, typeof input_schema>({
    path: "/api",
    input_schema,
    on_success: (result) => {
      /*
      This is typesafe if you pass in the action and input_schema
      generics to useAction as shown above. However, if you only
      need typesafe form inputs and don't care about the fetcher
      response shape, you can omit the generics.
      */
      console.log("Jerry", result.data)
    },
    options: {
      // skip_client_validation: true,
    },
    serialization_handlers,
  })
}
