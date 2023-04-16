import { DataFunctionArgs } from "@remix-run/node"
import { BouncerProps } from "../../../index"

export const bouncer = async ({ ctx, csrf_token }: BouncerProps) => {
  const session = get_session_from_ctx(ctx)
  const csrf_token_is_valid = csrf_token === "5"

  if (session && csrf_token_is_valid) {
    return session
  }

  throw new Error("Unauthorized")
}

const get_session_from_ctx = (ctx: DataFunctionArgs) => {
  return {
    user: {
      id: 490,
      name: "Bob",
    },
  }
}
