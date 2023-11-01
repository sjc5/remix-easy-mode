import React from "react"
import { InputHelper } from "../../../../src/unstyled-components/input-helper"
import { useExampleHook } from "./api"
import { TextInput, MantineProvider } from "@mantine/core"

const Comp = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return <input {...props} ref={ref} style={{ background: "orange" }} />
})

export default function Index() {
  const { Form, fields, result } = useExampleHook()

  const { Form: Form2, fields: fields2, result: result2 } = useExampleHook()

  return (
    <div>
      <MantineProvider>
        <Form
          csrfToken="5"
          onSuccess={(successRes) => console.log("form onSuccess", successRes)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label>
            Any old string (do not type "bad message")
            <InputHelper
              {...fields.anyString.props}
              defaultValue={"any old string"}
              component={TextInput}
              errorProps={{
                error: fields.anyString.errors?.[0]?.message,
              }}
            />
          </label>

          <label>
            Hello world (literal)
            <InputHelper
              {...fields.helloWorld.props}
              defaultValue={"hello world"}
            />
          </label>

          {/* ZOD UNION OF STRING LITERALS */}
          {fields.letters.options?.map((option) => {
            return (
              <label key={option}>
                {option}
                <InputHelper
                  type="radio"
                  {...fields.letters.props}
                  value={option}
                  defaultChecked={option === 2}
                />
              </label>
            )
          })}

          {/* ZOD ENUM */}
          {fields.letters2.options?.map((option) => {
            return (
              <label key={option}>
                {option}
                <InputHelper
                  type="radio"
                  {...fields.letters2.props}
                  value={option}
                  defaultChecked={option === "1"}
                />
              </label>
            )
          })}

          <InputHelper
            type="number"
            {...fields.someNumber.props}
            defaultValue={1}
          />

          <button type="submit">Submit</button>
        </Form>

        <pre>{JSON.stringify(result, null, 2)}</pre>

        <Form2
          csrfToken="5"
          onSuccess={(successRes) => console.log("form onSuccess", successRes)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label>
            Any old string (do not type "bad message")
            <InputHelper
              {...fields2.anyString.props}
              defaultValue={"any old string"}
              component={TextInput}
              errorProps={{
                error: fields2.anyString.errors?.[0]?.message,
              }}
            />
          </label>

          <label>
            Hello world (literal)
            <InputHelper
              {...fields2.helloWorld.props}
              defaultValue={"hello world"}
            />
          </label>

          {/* ZOD UNION OF STRING LITERALS */}
          {fields2.letters.options?.map((option) => {
            return (
              <label key={option}>
                {option}
                <InputHelper
                  type="radio"
                  {...fields2.letters.props}
                  value={option}
                  defaultChecked={option === 2}
                />
              </label>
            )
          })}

          {/* ZOD ENUM */}
          {fields2.letters2.options?.map((option) => {
            return (
              <label key={option}>
                {option}
                <InputHelper
                  type="radio"
                  {...fields.letters2.props}
                  value={option}
                  defaultChecked={option === "1"}
                />
              </label>
            )
          })}

          <InputHelper
            type="number"
            {...fields2.someNumber.props}
            defaultValue={1}
          />

          <button type="submit">Submit</button>
        </Form2>

        <pre>{JSON.stringify(result2, null, 2)}</pre>
      </MantineProvider>
    </div>
  )
}
