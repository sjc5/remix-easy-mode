import { DataFunctionArgs } from "@remix-run/node"
import { BouncerProps } from "../../../index"
import { expected_csrf_token } from "./routes/_index"

/*
Bouncers get passed the action/loader context (ctx) and any
csrf_token passed from the client into the action fetcher /
mutation callback.

If you want to check the session, you can do that here, or
if you want to protect against CSRF for mutations, you can
do that here. If the user is not authorized, throw an error.

NOTE:
We always require you to pass in a bouncer (or explicitly
set it to null or undefined) in the data_function_helper
as an opinionated security measure. It forces you to think
about access control right off the bat.
*/
export const bouncer = async ({ ctx, csrf_token }: BouncerProps) => {
  const session = get_session_from_ctx(ctx)
  const csrf_token_is_valid = csrf_token === expected_csrf_token

  if (session && csrf_token_is_valid) {
    return session
  }

  throw new Error("Unauthorized")
}

const get_session_from_ctx = (ctx: DataFunctionArgs) => {
  // get the user from the session or whatever
  return {
    user: {
      id: 490,
      name: "Bob",
    },
  }
}
