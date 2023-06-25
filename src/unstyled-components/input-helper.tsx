import { useMemo, useRef, useState } from "react"
import type { FormProps } from "../hooks/use-action"
import { ZodObject, ZodRawShape, z } from "zod"

export function InputHelper<T, N extends keyof Inferred<T>>({
  label,
  name,
  value,
  styles,
  ...props
}: InputHelperProps<T, N>) {
  const [value_state, set_value_state] = useState(
    props.type === "checkbox"
      ? props.defaultChecked ?? false
      : props.defaultValue ?? ""
  )

  const errors = props.validationErrors?.[name]?.map((error: string) => error)

  const input_value = useMemo(() => {
    const to_be_stringified =
      props.type === "checkbox" ? ref.current?.checked ?? false : value_state

    return props.seralizationHandlers?.stringify
      ? props.seralizationHandlers?.stringify(to_be_stringified)
      : JSON.stringify(to_be_stringified)
  }, [props.seralizationHandlers?.stringify, value_state, props.type])

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

export function TextAreaHelper<T, N extends keyof Inferred<T>>({
  label,
  name,
  value,
  styles,
  ...props
}: TextAreaHelperProps<T, N>) {
  const [value_state, set_value_state] = useState(props.defaultValue ?? "")

  const errors = props.validationErrors?.[name]?.map((error: any) => error)

  const input_value = useMemo(() => {
    return props.seralizationHandlers?.stringify
      ? props.seralizationHandlers?.stringify(value_state)
      : JSON.stringify(value_state)
  }, [props.seralizationHandlers?.stringify, value_state])

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

export type ZodObjectFromRawShape<RS extends ZodRawShape> = ZodObject<RS>

export type NarrowedForForm<T> = T extends ZodObject<infer RS>
  ? ZodObjectFromRawShape<RS>
  : never

export type Inferred<T> = NarrowedForForm<T>["_output"]

export type InputHelperBaseProps<T, N extends keyof Inferred<T>> = {
  label: string
  name: N
  value?: Inferred<T>[N]
  defaultValue?: Inferred<T>[N]
  stringify_fn?: (data: any) => string
} & FormProps<T>

export type InputHelperProps<
  T,
  N extends keyof Inferred<T>
> = InputHelperBaseProps<T, N> & {
  styles?: InputStyles
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">

export type TextAreaHelperProps<
  T,
  N extends keyof Inferred<T>
> = InputHelperBaseProps<T, N> & {
  styles?: TextAreaStyles
} & Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "defaultValue"
  >

export function RadioInputHelper<T, N extends keyof Inferred<T>>({
  label,
  styles,
  ...props
}: InputHelperProps<T, N>) {
  return (
    <div>
      <label className={styles?.label_wrapper}>
        <span className={styles?.label_span}>{label}</span>

        <input
          {...props}
          className={styles?.input}
          onChange={(e) => {
            props.onChange?.(e)
          }}
          type="radio"
        />
      </label>
    </div>
  )
}

type RadioInputItem<T> = [string, T, boolean?]

export function RadioGroupHelper<T, N extends keyof Inferred<T>>({
  name,
  styles,
  items,
  ...props
}: {
  items: RadioInputItem<Inferred<T>[N]>[]
} & Omit<InputHelperProps<T, N>, "label">) {
  return (
    <div>
      {items.map((item) => {
        const [label, value] = item

        return (
          <div key={value}>
            <label className={styles?.label_wrapper}>
              <span className={styles?.label_span}>{label}</span>

              <input
                {...props}
                className={styles?.input}
                onChange={(e) => {
                  props.onChange?.(e)
                }}
                type="radio"
                name={name}
                value={value}
                defaultChecked={item[2]}
              />
            </label>
          </div>
        )
      })}
    </div>
  )
}
