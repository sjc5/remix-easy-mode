# Remix Easy Mode

Simple, typesafe toolkit for developing highly interactive Remix apps

## Features

- 100% typesafe
- Built on zod
- Inspired by TRPC
- Designed for building highly interactive apps
- Bone-simple client form validations
- Server-side input validations _a la_ TRPC
- Session middleware via "bouncer" pattern
- `onSuccess`, `onError`, and `onSettled` mutation callbacks _a la_ react-query
- Input helpers are unstyled (and polymorphic, if you want to supply your own input components)
- Optional custom serializers (_e.g._, `superjson`)
- MIT licensed

## Installation

```bash
npm i remix-easy-mode zod
```

## Usage

### Resource Route

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
      // (1) throw error or (2) return user session
    },
    fn: async ({ input, session }) => console.log({ input, session }), // typesafe!,
  })
}

// return hook from your resource route to use on client
export function useExample() {
  return useAction<typeof action, typeof schema>({
    path: "/resource-route",
    schema,
    onSuccess: (res) => console.log(res), // typesafe!,
  })
}
```

### Client-side Form

```tsx
import { InputHelper } from "remix-easy-mode"
import { useExample } from "./resource-route"
import { StyledInput } from "./your-custom-input-component"

export default function Index() {
  const { Form, fields } = useExample()

  return (
    <div>
      <Form
        csrfToken="whatever" // optional
        onSuccess={(res) => console.log(res)} // typesafe!
      >
        <InputHelper {...fields.someUserInput.props} component={StyledInput} />

        <button>Submit</button>
      </Form>
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

## Disclaimer

This is a work in progress. It's not yet battle-tested, and the pre-1.0.0 API will change without notice. If you want to use this in production, be careful, and set your dependency to a specific version.
