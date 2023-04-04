import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { z } from "zod"
import { data_function_helper } from "../src/server/data-function-helpers.server"
import { useAction } from "../src/hooks/use-action"
import { bouncer } from "./example-bouncer"

const input_schema = z.object({
  some_user_input: z.literal("hello world", {
    invalid_type_error: `Oops, you were supposed to type "hello world"!`,
  }),
})

export const action = (ctx: DataFunctionArgs) => {
  return data_function_helper({
    ctx,
    input_schema,
    bouncer,
    callback: async ({ input, session }) => {
      const status_text = session.user.is_logged_in
        ? `logged in as user ${session.user.id}`
        : "not logged in"

      return {
        message_to_display:
          `You are ${status_text}. You typed: ${input.some_user_input}.` as const,
      }
    },
  })
}

export const useExampleHook = () => {
  return useAction<typeof action, typeof input_schema>({
    path: "/example-resource-route",
    input_schema,
    on_success: (data) => {
      /*
      This is typesafe if you pass in the action and input_schema
      generics to useAction as shown above. However, if you only
      need typesafe form inputs and don't care about the fetcher
      response shape, you can omit the generics.
      */
      console.log(data.success ? data.result : data.result)
    },
  })
}
