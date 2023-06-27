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
            },
            csrfToken: "5",
            onSuccess: (successRes) => {
              console.log("from mutate onSuccess!", successRes)
            },
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
              {option}
              <InputHelper
                type="radio"
                {...fields.letters.inputProps}
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
                {...fields.letters2.inputProps}
                value={option}
                defaultChecked={option === "1"}
              />
            </label>
          )
        })}

        <InputHelper
          type="number"
          {...fields.someNumber.inputProps}
          defaultValue={0}
        />

        <button type="submit">Submit</button>
      </Form>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
