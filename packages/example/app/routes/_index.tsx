import { FormHelper, InputHelper } from "../../../../index"
import { useExampleHook } from "./api"

export default function Index() {
  const csrf_token = "5" // <-- try passing "4" -- the example bouncer will reject it

  const { run, form_props, result } = useExampleHook()

  // HINT: Always make sure to pass "form_props" to the helper components. Otherwise
  // the magic won't work.
  return (
    <div>
      <FormHelper
        form_props={form_props}
        on_submit={({ input }) => {
          // These input values are typesafe :)
          console.log(input.some_user_input)

          run({ input, csrf_token })
        }}
      >
        {/* Form validation runs client-side on submit, and if it fails,
        it won't even try posting to the server. In this example, that
        means if you type anything other than "hello world", there will
        be no network request. If you type "hello world", then the post
        will go through, and the input will be validated again on the
        server before being passed to the bouncer and then the action
        callback. */}
        <InputHelper
          form_props={form_props}
          label="Hello world"
          // Try changing "name" below -- it will cause a TS error
          name="some_user_input"
        />

        <button type="submit">Submit</button>
      </FormHelper>

      <pre>{JSON.stringify(result?.data, null, 2)}</pre>
    </div>
  )
}
