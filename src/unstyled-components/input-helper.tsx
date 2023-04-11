import { useMemo, useRef, useState } from "react"
import type { FormProps } from "../hooks/use-action"

export function InputHelper<T>({
  label,
  name,
  form_props,
  value,
  styles,
  ...props
}: InputHelperProps<T>) {
  const [value_state, set_value_state] = useState(
    props.type === "checkbox"
      ? props.defaultChecked ?? false
      : props.defaultValue ?? ""
  )

  const errors = form_props.validation_errors?.[name]?.map(
    (error: string) => error
  )

  const input_value = useMemo(() => {
    const to_be_stringified =
      props.type === "checkbox" ? ref.current?.checked ?? false : value_state

    return form_props.serialization_handlers?.stringify
      ? form_props.serialization_handlers?.stringify(to_be_stringified)
      : JSON.stringify(to_be_stringified)
  }, [form_props.serialization_handlers?.stringify, value_state, props.type])

  const ref = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input name={name} type="hidden" value={input_value} />

      <label className={styles?.label_wrapper}>
        <span className={styles?.label_span}>{label}</span>

        <input
          {...props}
          className={styles?.input}
          onChange={(e) => {
            set_value_state(
              props.type === "checkbox" ? e.target.checked : e.target.value
            )
            props.onChange?.(e)
          }}
          ref={ref}
        />
      </label>

      <ZodErrorsDisplay errors={errors} styles={styles} />
    </div>
  )
}

export function TextAreaHelper<T>({
  label,
  name,
  form_props,
  value,
  styles,
  ...props
}: TextAreaHelperProps<T>) {
  const [value_state, set_value_state] = useState(props.defaultValue ?? "")

  const errors = form_props.validation_errors?.[name]?.map(
    (error: any) => error
  )

  const input_value = useMemo(() => {
    return form_props.serialization_handlers?.stringify
      ? form_props.serialization_handlers?.stringify(value_state)
      : JSON.stringify(value_state)
  }, [form_props.serialization_handlers?.stringify, value_state])

  return (
    <div>
      <input name={name} type="hidden" value={input_value} />

      <label className={styles?.label_wrapper}>
        <span className={styles?.label_span}>{label}</span>

        <textarea
          {...props}
          className={styles?.text_area}
          onChange={(e) => {
            set_value_state(e.target.value)
            props.onChange?.(e)
          }}
        />
      </label>

      <ZodErrorsDisplay errors={errors} styles={styles} />
    </div>
  )
}

const ZodErrorsDisplay = ({
  errors,
  styles,
}: {
  errors: string[] | undefined
  styles?: {
    errors_wrapper?: string
    error?: (index: number) => string
  }
}) => {
  return (
    <>
      {Boolean(errors?.length) && (
        <div className={styles?.errors_wrapper}>
          {errors?.map((error, index) => (
            <div className={styles?.error?.(index)} key={error}>
              {error}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export type InputStylesBase = {
  label_wrapper?: string
  label_span?: string
  errors_wrapper?: string
  error?: (i: number) => string
}

export type InputStyles = InputStylesBase & {
  input?: string
}

export type TextAreaStyles = InputStylesBase & {
  text_area?: string
}

export type InputHelperBaseProps<T> = {
  label: string
  name: keyof T extends string ? keyof T : never
  form_props: FormProps<T>
  value?: T[keyof T]
  stringify_fn?: (data: any) => string
}

export type InputHelperProps<T> = InputHelperBaseProps<T> & {
  styles?: InputStyles
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">

export type TextAreaHelperProps<T> = InputHelperBaseProps<T> & {
  styles?: TextAreaStyles
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value">
