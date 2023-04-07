import { obj_from_fd } from "../common/common-helpers"
import { FormProps } from "../hooks/use-action"

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
        const input = obj_from_fd(fd) as T

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
