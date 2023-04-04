import { json } from "@remix-run/server-runtime"

export const handle_api_success = <U>({
  result,
  response_init,
}: {
  result: U
  response_init?: ResponseInit
}) => {
  return json(
    {
      success: true as const,
      result: result,
      error: null,
      at: Date.now(),
    },
    response_init
  )
}

export const handle_api_error = ({
  error,
  error_message,
  response_init,
}: {
  error: unknown
  error_message: string
  response_init?: ResponseInit
}) => {
  console.error(error)

  return json(
    {
      success: false as const,
      result: null,
      error: error_message || "Something went wrong.",
      at: Date.now(),
    },
    {
      ...response_init,
      status: response_init?.status || 500,
    }
  )
}
