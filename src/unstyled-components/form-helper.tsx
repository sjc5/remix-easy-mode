import { obj_from_fd } from "@kiruna/form-data"
import type { FormProps } from "../hooks/use-action"
import { ZodObject, ZodRawShape, ZodDiscriminatedUnion, z } from "zod"

export function FormHelper<
  RawShape extends ZodRawShape,
  Inferred extends
    | ZodObject<RawShape>["_output"]
    | ZodDiscriminatedUnion<string, [ZodObject<RawShape>]>["_output"]
>({
  on_submit,
  form_props,
  ...props
}: {
  on_submit: ({
    input,
    e,
  }: {
    input: Inferred
    e: React.FormEvent<HTMLFormElement>
  }) => void
  form_props: FormProps<RawShape, Inferred>
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const fd = new FormData(e.target as HTMLFormElement)
        const input = obj_from_fd(
          fd,
          form_props.serialization_handlers?.parse
        ) as Inferred

        on_submit({
          input,
          e,
        })
      }}
      {...props}
    >
      {props.children}
    </form>
  )
}
