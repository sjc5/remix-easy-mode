import { FormHelper, InputHelper } from "../../../../index"
import { REQUIRED_INPUT_STRING, useExampleHook } from "./api"

export default function Index() {
  const { run, form_props, result } = useExampleHook()

  const csrf_token = expected_csrf_token

  // HINT: Always make sure to pass "form_props" to the helper components. Otherwise
  // the magic won't work.
  return (
    <div>
      <FormHelper
        form_props={form_props}
        on_submit={({ input }) => {
          // These input values are typesafe :)
          console.log(input)

          run({
            input,
            csrf_token,
            options: {
              // skip_client_validation: false,
            },
          })
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
          defaultValue={REQUIRED_INPUT_STRING}
        />

        <button type="submit">Submit</button>
      </FormHelper>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}

export const expected_csrf_token = "9d*73sdu/d/s"
