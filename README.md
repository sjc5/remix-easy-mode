# remix-easy-mode

## Description

Opinionated toolkit for developing highly interactive, typesafe Remix apps. Built with zod, and inspired by the TRPC / React Query DX (type-safety + react-query style "on settled" mutation callbacks), plus a few extra goodies (such as typesafe form helpers with automatic client-side validations).

## Features

- Automatic form validations (client-side and server-side)
- Typesafe form inputs and data responses via helper components / hooks
- Typesafe session middleware support (via "bouncer" pattern)
- Typesafe session and input values passed to server-side callbacks
- Automatic error handling and error message display
- Component helpers are unstyled, so you can style them however you want

## Installation

```bash
npm i remix-easy-mode zod
```

## Video Tutorial

https://www.youtube.com/watch?v=CxrtfHbXKuM

## Usage

Example resource route:

```tsx
import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { dataFunctionHelper, useAction } from "remix-easy-mode"
import { z } from "zod"

const schema = z.object({
  some_user_input: z.string(),
})

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
import { FormHelper, InputHelper } from "remix-easy-mode"
import { useExampleHook } from "./resource-route"

export default function Index() {
  const { run, formProps, result } = useExampleHook()

  return (
    <div>
      <FormHelper
        formProps={formProps}
        onSubmit={({ input }) => {
          run({ input })
        }}
      >
        <InputHelper
          formProps={formProps}
          label="Whatever"
          name="some_user_input"
        />

        <button type="submit">Submit</button>
      </FormHelper>

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

## Caveats

- This is a work in progress. It's not yet battle-tested, and the API may change without notice. If you want to use this in production, set your dependency to a specific version.
