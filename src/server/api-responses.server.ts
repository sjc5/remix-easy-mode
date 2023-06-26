import { json } from "@remix-run/server-runtime"

async function handle_api_success<RawResult>({
  result,
  response_init,
}: {
  result: RawResult
  response_init?: ResponseInit
}) {
  const payload = {
    success: true as const,
    data: result,
    error: undefined,
    at: Date.now(),
  }

  return json(payload, response_init) as unknown as typeof payload
}

async function handle_api_error({
  error,
  error_message,
  response_init,
}: {
  error: unknown
  error_message: string
  response_init?: ResponseInit
}) {
  console.error(error)

  const payload = {
    success: false as const,
    data: undefined,
    error: error_message || "Something went wrong.",
    at: Date.now(),
  }

  const response_init_to_use = {
    ...response_init,
    status: response_init?.status || 500,
  }

  return json(payload, response_init_to_use) as unknown as typeof payload
}

export { handle_api_success, handle_api_error }
