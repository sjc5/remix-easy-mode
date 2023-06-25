import { FormHelper, InputHelper, RadioGroupHelper } from "../../../../index"
import { useExampleHook } from "./api"

export default function Index() {
  const { submit, formProps, result, fetcher, isLoading } = useExampleHook()

  return (
    <div>
      <FormHelper
        {...formProps}
        onSubmit={({ input }) => {
          submit({
            input,
            csrfToken: "5",
          })
        }}
      >
        <InputHelper
          {...formProps}
          label="Hello world"
          name="any_string"
          defaultValue={"any old string"}
        />

        <InputHelper
          {...formProps}
          label="Hello world"
          name="hello_world"
          defaultValue={"hello world"}
        />

        <RadioGroupHelper
          {...formProps}
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
