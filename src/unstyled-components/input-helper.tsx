import React, { useMemo, useRef, useState } from "react"
import { ZodObject, ZodRawShape, z } from "zod"
import { SerializationHandlers } from "../hooks/use-action"

function InputHelper<
  T,
  N extends keyof Inferred<T>,
  C extends React.ForwardRefExoticComponent<any>
>({
  name,
  component: Component,
  schema,
  stringifyFn,
  ...props
}: {
  component?: C
} & React.ComponentPropsWithoutRef<C> &
  InputHelperProps<T, N>) {
  const ref = useRef<HTMLInputElement>(null)
  const isCheckedOrSelected = ref.current?.checked ?? false
  const isCheckbox = props.type === "checkbox"

  const [valueState, setValueState] = useState(
    isCheckbox
      ? props.defaultChecked ?? props.checked ?? false
      : props.defaultValue ?? props.value ?? ""
  )

  const stringifyToUse = useMemo(() => {
    return stringifyFn ?? JSON.stringify
  }, [stringifyFn])

  const inputValue = useMemo(() => {
    const toBeStringified = isCheckbox ? isCheckedOrSelected : valueState

    return stringifyToUse(
      props.type === "number" ? Number(toBeStringified) : toBeStringified
    )
  }, [stringifyFn, valueState, props.type])

  const Comp = useMemo(() => Component ?? "input", [Component])

  return (
    <>
      {<input name={name} type="hidden" value={inputValue} />}

      <Comp
        {...props}
        onChange={(e) => {
          setValueState(isCheckbox ? e.target.checked : e.target.value)
          props.onChange?.(e)
        }}
        ref={ref}
      />
    </>
  )
}

function TextAreaHelper<
  T,
  N extends keyof Inferred<T>,
  C extends React.ForwardRefExoticComponent<any>
>({
  name,
  component: Component,
  schema,
  stringifyFn,
  ...props
}: {
  component?: C
} & React.ComponentPropsWithoutRef<C> &
  TextAreaHelperProps<T, N>) {
  const [valueState, setValueState] = useState(props.defaultValue ?? "")

  const inputValue = useMemo(() => {
    return stringifyFn ? stringifyFn(valueState) : JSON.stringify(valueState)
  }, [stringifyFn, valueState])

  const Comp = useMemo(() => Component ?? "input", [Component])

  return (
    <>
      <input name={name} type="hidden" value={inputValue} />

      <Comp
        {...props}
        onChange={(e) => {
          setValueState(e.target.value)
          props.onChange?.(e)
        }}
      />
    </>
  )
}

type ZodObjectFromRawShape<RS extends ZodRawShape> = ZodObject<RS>

type NarrowedForForm<T> = T extends ZodObject<infer RS>
  ? ZodObjectFromRawShape<RS>
  : never

type Inferred<T> = NarrowedForForm<T>["_output"]

type InputHelperBaseProps<T, N extends keyof Inferred<T>> = {
  name: N
  value?: Inferred<T>[N]
  defaultValue?: Inferred<T>[N]
} & FormProps<T>

type InputHelperProps<T, N extends keyof Inferred<T>> = InputHelperBaseProps<
  T,
  N
> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">

type TextAreaHelperProps<T, N extends keyof Inferred<T>> = InputHelperBaseProps<
  T,
  N
> &
  Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "defaultValue"
  >

type FormProps<T> = {
  schema: T extends NarrowedForForm<T> ? T : never | null | undefined
  stringifyFn?: SerializationHandlers["stringify"]
}

export { InputHelper, TextAreaHelper }
