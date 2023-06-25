import { DataFunctionArgs } from "@remix-run/node"
import { BouncerProps } from "../../../index"

export const bouncer = async ({ ctx, csrfToken }: BouncerProps) => {
  const session = get_session_from_ctx(ctx)
  const csrfToken_is_valid = csrfToken === "5"

  if (session && csrfToken_is_valid) {
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
