import { BouncerProps } from "../src/server/data-function-helpers.server"

/*
Bouncers get passed the action/loader context (ctx) and the
user-submitted csrf_token (probably from a hidden input field).

If you want to check the session, you can do that here, or
if you want to protect against CSRF for mutations, you can
do that here. If the user is not authorized, throw an error.

NOTE:
We always require you to pass in a bouncer and a csrf_token 
as an opinionated security measure during development. It 
forces you to think about access control right off the bat.
If you want to explicity bypass the bouncer, just pass in
an empty string for a csrf_token and set your bouncer to
`() => undefined`. In future versions we may relax these
opinions / requirements for flexibility... we'll see.
*/
export const bouncer = async ({ ctx, csrf_token }: BouncerProps) => {
  // Check session if and however you want
  const is_logged_in = true

  // Check csrf_token if and however you want
  const csrf_token_is_valid = csrf_token === "5"

  if (is_logged_in && csrf_token_is_valid) {
    return {
      user: {
        is_logged_in,
        id: 490,
        name: "Bob",
      },
    }
  }

  throw new Error("Unauthorized")
}
