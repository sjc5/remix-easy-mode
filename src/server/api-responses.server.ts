import { json } from "@remix-run/server-runtime"

async function handleApiSuccess<RawResult>({
  result,
  responseInit,
}: {
  result: RawResult
  responseInit?: ResponseInit
}) {
  const payload = {
    success: true as const,
    data: result,
    error: undefined,
    at: Date.now(),
  }

  return json(payload, responseInit) as unknown as typeof payload
}

async function handleApiError({
  error,
  errorMessage,
  responseInit,
}: {
  error: unknown
  errorMessage: string
  responseInit?: ResponseInit
}) {
  console.error(error)

  const payload = {
    success: false as const,
    data: undefined,
    error: errorMessage || "Something went wrong.",
    at: Date.now(),
  }

  const responseInitToUse = {
    ...responseInit,
    status: responseInit?.status || 500,
  }

  return json(payload, responseInitToUse) as unknown as typeof payload
}

export { handleApiSuccess, handleApiError }
