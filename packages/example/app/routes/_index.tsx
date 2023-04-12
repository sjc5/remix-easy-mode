import { FormHelper, InputHelper, RadioGroupHelper } from "../../../../index"
import { useExampleHook } from "./api"

export default function Index() {
  const { run, form_props, result } = useExampleHook()

  return (
    <div>
      <FormHelper
        form_props={form_props}
        on_submit={({ input }) => {
          run({
            input,
            csrf_token: "5",
          })
        }}
      >
        <InputHelper
          form_props={form_props}
          label="Hello world"
          name="any_string"
          defaultValue={"any old string"}
        />

        <InputHelper
          form_props={form_props}
          label="Hello world"
          name="hello_world"
          defaultValue={"hello world"}
        />

        <RadioGroupHelper
          form_props={form_props}
          name="letters"
          items={[
            ["A", "a"],
            ["B", "b"],
            ["C", "c", true],
          ]}
        />

        <button type="submit">Submit</button>
      </FormHelper>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
