import React from "react"
import { InputHelper } from "../../../../src/unstyled-components/input-helper"
import { useExampleHook } from "./api"
import { TextInput } from "@mantine/core"

const Comp = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return <input {...props} ref={ref} style={{ background: "orange" }} />
})

export default function Index() {
  const { Form, fields, result } = useExampleHook()

  return (
    <div>
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
          defaultValue={0}
        />

        <button type="submit">Submit</button>
      </Form>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
