import { obj_from_fd } from "@kiruna/form-data"
import type { FormProps } from "../hooks/core/use-action"

export function FormHelper<T>({
  on_submit,
  form_props,
  ...props
}: {
  on_submit: ({
    input,
    e,
  }: {
    input: T
    e: React.FormEvent<HTMLFormElement>
  }) => void
  form_props: FormProps<T>
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const fd = new FormData(e.target as HTMLFormElement)
        const input = obj_from_fd(
          fd,
          form_props.serialization_handlers?.parse
        ) as T

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
