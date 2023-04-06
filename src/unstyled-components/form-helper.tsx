import {
  flatten_safe_parse_errors,
  obj_from_fd,
} from "../common/common-helpers"
import { FormProps } from "../hooks/use-action"

export function FormHelper<T>({
  on_submit,
  form_props: { set_validation_errors, input_schema, options },
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
        const obj = obj_from_fd(fd)
        const parsed_obj = input_schema.safeParse(obj)

        if (!parsed_obj.success) {
          const flattened_errors = flatten_safe_parse_errors(parsed_obj)

          if (process.env.NODE_ENV === "development") {
            console.error("parse error", {
              error: flattened_errors,
              attempted_input: obj,
            })
          }

          set_validation_errors(flattened_errors)
          return
        }

        on_submit({
          input: parsed_obj.data,
          e,
        })
      }}
      {...props}
    >
      {props.children}
    </form>
  )
}
