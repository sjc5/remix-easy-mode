import { obj_from_fd } from "@kiruna/form-data"
import type { FormProps } from "../hooks/use-action"
import { Inferred } from "./input-helper"

export function FormHelper<T>({
  onSubmit,
  ...props
}: {
  onSubmit: ({
    input,
    e,
  }: {
    input: Inferred<T>
    e: React.FormEvent<HTMLFormElement>
  }) => void
} & FormProps<T> &
  Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const fd = new FormData(e.target as HTMLFormElement)
        const input = obj_from_fd(
          fd,
          props.seralizationHandlers?.parse
        ) as Inferred<T>

        onSubmit({
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
