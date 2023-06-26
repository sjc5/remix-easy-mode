import { DataFunctionArgs } from "@remix-run/node"
import { BouncerProps } from "../../../index"
// import { BouncerProps } from "remix-easy-mode"

export const bouncer = async ({ ctx, csrfToken }: BouncerProps) => {
  const session = getSessionFromCtx(ctx)
  const csrfTokenIsValid = csrfToken === "5"

  if (session && csrfTokenIsValid) {
    return session
  }

  throw new Error("Unauthorized")
}

const getSessionFromCtx = (ctx: DataFunctionArgs) => {
  return {
    user: {
      id: 490,
      name: "Bob",
    },
  }
}
