import { stringify } from "superjson"

export const handle_api_success = async <U>({
  result,
  response_init,
}: {
  result: U
  response_init?: ResponseInit
}) => {
  const payload = {
    success: true as const,
    data: result,
    error: null,
    at: Date.now(),
  }

  return new Response(
    stringify(payload),
    response_init
  ) as unknown as typeof payload
}

export const handle_api_error = async ({
  error,
  error_message,
  response_init,
}: {
  error: unknown
  error_message: string
  response_init?: ResponseInit
}) => {
  console.error(error)

  const payload = {
    success: false as const,
    data: null,
    error: error_message || "Something went wrong.",
    at: Date.now(),
  }

  return new Response(stringify(payload), {
    ...response_init,
    status: response_init?.status || 500,
  }) as unknown as typeof payload
}
