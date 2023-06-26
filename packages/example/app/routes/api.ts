import type { DataFunctionArgs } from "@remix-run/node"
import { z } from "zod"
// import { dataFunctionHelper, useAction } from "../../../../index"
import { dataFunctionHelper, useAction } from "remix-easy-mode"

import { bouncer } from "../bouncer"

const schema = z.object({
  anyString: z.string().refine((val) => val !== "bad message", {
    message: `Oops, you weren't supposed to write that!`,
  }),
  helloWorld: z.literal("hello world"),
  letters: z.union([z.literal("a"), z.literal("b"), z.literal("c")]),
})

export const action = (ctx: DataFunctionArgs) => {
  return dataFunctionHelper({
    ctx,
    schema,
    bouncer,
    fn: async ({ input, session }) => {
      const statusText = session.user
        ? `logged in as user ${session.user.id}`
        : "not logged in"

      return `You are ${statusText}. You typed: ${input.anyString}.` as const
    },
  })
}

export const useExampleHook = () => {
  return useAction<typeof action, typeof schema>({
    path: "/api",
    schema,
    onSuccess: (result) => {
      console.log("Jerry", result.data)
    },
  })
}
