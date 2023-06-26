import React, { useMemo, useRef, useState } from "react"
import { ZodObject, ZodRawShape, z } from "zod"
import { SerializationHandlers } from "../hooks/use-action"

function InputHelper<
  T,
  N extends keyof Inferred<T>,
  C extends React.ForwardRefExoticComponent<any>
>({
  name,
  polyComp: Component,
  schema,
  stringifyFn,
  ...props
}: {
  polyComp?: C
} & React.ComponentPropsWithoutRef<C> &
  InputHelperProps<T, N>) {
  const [valueState, setValueState] = useState(
    props.type === "checkbox"
      ? props.defaultChecked ?? false
      : props.defaultValue ?? ""
  )

  const inputValue = useMemo(() => {
    const toBeStringified =
      props.type === "checkbox" ? ref.current?.checked ?? false : valueState

    return stringifyFn
      ? stringifyFn(toBeStringified)
      : JSON.stringify(toBeStringified)
  }, [stringifyFn, valueState, props.type])

  const ref = useRef<HTMLInputElement>(null)

  const Comp = useMemo(() => Component ?? "input", [Component])

  return (
    <>
      <input name={name} type="hidden" value={inputValue} />

      <Comp
        {...props}
        onChange={(e) => {
          setValueState(
            props.type === "checkbox" ? e.target.checked : e.target.value
          )
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
  polyComp: Component,
  schema,
  stringifyFn,
  ...props
}: {
  polyComp?: C
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
