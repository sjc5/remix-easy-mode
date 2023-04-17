import type { DataFunctionArgs } from "@remix-run/node"
import { z } from "zod"
import { data_function_helper, useAction } from "../../../../index"
import { bouncer } from "../bouncer"

const input_schema = z.object({
  any_string: z.string().refine((val) => val !== "bad message", {
    message: `Oops, you weren't supposed to write that!`,
  }),
  hello_world: z.literal("hello world"),
  letters: z.union([z.literal("a"), z.literal("b"), z.literal("c")]),
})

export const action = (ctx: DataFunctionArgs) => {
  return data_function_helper({
    ctx,
    input_schema,
    bouncer,
    callback: async ({ input, session }) => {
      const status_text = session.user
        ? `logged in as user ${session.user.id}`
        : "not logged in"

      return `You are ${status_text}. You typed: ${input.any_string}.` as const
    },
  })
}

export const useExampleHook = () => {
  return useAction<typeof action, typeof input_schema>({
    path: "/api",
    input_schema,
    on_success: (result) => {
      console.log("Jerry", result.data)
    },
  })
}
