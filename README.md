# remix-easy-mode

## Description

Opinionated toolkit for developing highly interactive, typesafe Remix apps. Built with zod and superjson. Inspired by the TRPC / React Query DX.

## Features

- Automatic form validations (client-side and server-side)
- Typesafe form inputs and data responses via helper components / hooks
- Typesafe session middleware support (via "bouncer" pattern)
- Typesafe session and input values passed to server-side callbacks
- Automatic error handling and error message display
- Component helpers are unstyled, so you can style them however you want

## Installation

```bash
npm i remix-easy-mode zod superjson
```

## Usage

Example resource route:

```tsx
import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { data_function_helper, useAction } from "remix-easy-mode"
import { z } from "zod"

const input_schema = z.object({
  some_user_input: z.string(),
})

export const action = (ctx: DataFunctionArgs) => {
  return data_function_helper({
    ctx,
    input_schema,
    bouncer: async ({ ctx, csrf_token }) => {
      // return session or throw error
    },
    callback: async ({ input, session }) => {
      // do whatever you want here
      return "Wow, that was easy!" as const
    },
  })
}

// return hook from your resource route to use on client
export const useExampleHook = () => {
  return useAction<typeof action, typeof input_schema>({
    path: "/resource-route",
    input_schema,
    on_success: (data) => {
      console.log(data.success ? data.result : data.error)
    },
  })
}
```

Example client-side form:

```tsx
import { FormHelper, InputHelperUnstyled } from "remix-easy-mode"
import { useExampleHook } from "./resource-route"

export default function Index() {
  const { run, form_props, fetcher } = useExampleHook()

  return (
    <div>
      <FormHelper
        form_props={form_props}
        on_submit={({ input }) => {
          run({ input, csrf_token: "" })
        }}
      >
        <InputHelperUnstyled
          form_props={form_props}
          label="Whatever"
          name="some_user_input"
        />
      </FormHelper>

      {fetcher.data?.success ? <div>{fetcher.data.result}</div> : null}
    </div>
  )
}
```

## Examples

More fulsome examples (with comments) are available in the `examples` folder.

## License

MIT

## Caveats

- This is a work in progress. It's not yet battle-tested, and the API may change without notice. If you want to use this in production, set your dependency to a specific version.
- This library is admittedly super simple and super opinionated. It may evolve to be more flexible over time – we shall see.
- If you know of smarter ways to do these things without massively overcomplicating the mental model, please let me know!
