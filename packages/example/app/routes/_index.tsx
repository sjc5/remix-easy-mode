import { useExampleHook } from "./api"

export default function Index() {
  const { submit, result, Form, fields } = useExampleHook()

  return (
    <div>
      <Form
        onSubmit={({ input }) => {
          submit({
            input,
            csrfToken: "5",
          })
        }}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Any old string
          <input
            name={fields.any_string.name}
            defaultValue={"any old string"}
          />
        </label>

        <label>
          Hello world (literal)
          <input name={fields.hello_world.name} defaultValue={"hello world"} />
        </label>

        {fields.letters.options.map((option) => {
          return (
            <label key={option}>
              {radio_labels[option]}
              <input
                type="radio"
                name={fields.letters.name}
                value={option}
                key={option}
                defaultChecked={option === "a"}
              />
            </label>
          )
        })}

        <button type="submit">Submit</button>
      </Form>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}

const radio_labels = {
  a: "A",
  b: "B",
  c: "C",
} as const
