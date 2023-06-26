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
          <input name={fields.anyString.name} defaultValue={"any old string"} />
        </label>

        <label>
          Hello world (literal)
          <input name={fields.helloWorld.name} defaultValue={"hello world"} />
        </label>

        {/* ZOD UNION OF STRING LITERALS */}
        {fields.letters.options?.map((option) => {
          return (
            <label key={option}>
              {radioLabels[option]}
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

        {/* ZOD ENUM */}
        {fields.letters2.options?.map((option) => {
          return (
            <label key={option}>
              {radioLabels[option]}
              <input
                type="radio"
                name={fields.letters2.name}
                value={option}
                key={option}
                defaultChecked={option === "a"}
              />
            </label>
          )
        })}

        {/* ZOD NATIVE ENUM */}
        {fields.letters3.options?.map((option) => {
          return (
            <label key={option}>
              {radioLabels[option]}
              <input
                type="radio"
                name={fields.letters3.name}
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

const radioLabels = {
  a: "A",
  b: "B",
  c: "C",
} as const
