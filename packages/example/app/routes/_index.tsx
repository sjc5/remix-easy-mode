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
  const { Form, mutate, fields, result } = useExampleHook()

  return (
    <div>
      <Form
        onSubmit={({ input }) => {
          mutate({
            input: {
              ...input,
              letters2: "c",
            },
            csrfToken: "5",
          })
        }}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Any old string (do not type "bad message")
          <InputHelper
            {...fields.anyString.inputProps}
            defaultValue={"any old string"}
            polyComp={TextInput}
            errorProps={{
              error: fields.anyString.errors?.[0]?.message,
            }}
          />
        </label>

        <label>
          Hello world (literal)
          <InputHelper
            {...fields.helloWorld.inputProps}
            defaultValue={"hello world"}
          />
        </label>

        {/* ZOD UNION OF STRING LITERALS */}
        {fields.letters.options?.map((option) => {
          return (
            <label key={option}>
              {radioLabels[option]}
              <input
                type="radio"
                name={fields.letters.inputProps.name}
                value={option}
                key={option}
                defaultChecked={option === "a"}
              />
            </label>
          )
        })}

        {/* ZOD ENUM */}
        {/* {fields.letters2.options?.map((option) => {
          return (
            <label key={option}>
              {radioLabels[option]}
              <input
                type="radio"
                name={fields.letters2.inputProps.name}
                value={option}
                key={option}
                defaultChecked={option === "b"}
              />
            </label>
          )
        })} */}

        {/* ZOD NATIVE ENUM */}
        {fields.letters3.options?.map((option) => {
          return (
            <label key={option}>
              {radioLabels[option]}
              <input
                type="radio"
                name={fields.letters3.inputProps.name}
                value={option}
                key={option}
                defaultChecked={option === "c"}
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
