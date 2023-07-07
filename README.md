# Remix Easy Mode

## Description

Simple toolkit for developing highly interactive, typesafe Remix apps.

## Features

- Built with zod
- Inspired by TRPC / TanStack Query
- 100% typesafe
- Designed to be used in highly interactive apps
- Automatic client- and server-side form validations
- Typesafe session middleware support (via "bouncer" pattern)
- Typesafe session and input values passed to server-side callbacks, similar to TRPC
- TanStack Query style "on settled" mutation callbacks (e.g., `onSuccess`, `onError`, `onSettled`)
- Input helpers are unstyled (and polymorphic, if you want to supply your own input component)

## Installation

```bash
npm i remix-easy-mode zod
```

## Usage

Example resource route:

```tsx
import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { dataFunctionHelper, useAction } from "remix-easy-mode"
import { z } from "zod"

const schema = z.object({
  someUserInput: z.string(),
})

// this is like a TRPC procedure
export const action = (ctx: DataFunctionArgs) => {
  return dataFunctionHelper({
    ctx,
    schema,
    bouncer: async ({ ctx, csrfToken }) => {
      // do whatever you want here
      // throw an error if something is wrong
    },
    fn: async ({ input, session }) => {
      // do whatever you want here
      return "Wow, that was easy!" as const
    },
  })
}

// return hook from your resource route to use on client
export const useExampleHook = () => {
  return useAction<typeof action, typeof schema>({
    path: "/resource-route",
    schema,
    onSuccess: (data) => console.log(data),
  })
}
```

Example client-side form:

```tsx
import { InputHelper } from "remix-easy-mode"
import { useExampleHook } from "./resource-route"
import { StyledInput } from "./your-custom-input-component"

export default function Index() {
  const { Form, fields, result } = useExampleHook()

  const someUserInputErrors = fields.someUserInput.errors

  return (
    <div>
      <Form
        csrfToken="whatever" // optional
        onSuccess={(res) => console.log("typesafe!", res)}
      >
        <InputHelper {...fields.someUserInput.props} component={StyledInput} />

        <button type="submit">Submit</button>
      </Form>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
```

## Example App

To run the example app:

```bash
pnpm install
cd packages/example
pnpm run dev
```

Then visit `localhost:3000`.

## License

MIT

## Disclaimer

This is a work in progress. It's not yet battle-tested, and the pre-1.0.0 API will change without notice. If you want to use this in production, set your dependency to a specific version.
