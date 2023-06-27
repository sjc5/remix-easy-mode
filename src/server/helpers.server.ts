import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { obj_from_fd as objectFromFormData } from "@kiruna/form-data"

async function objFromCtx(
  ctx: DataFunctionArgs,
  parseFn?: (input: string) => unknown
) {
  if (ctx.request.method === "GET") {
    return ctx.params
  }
  try {
    const json = await ctx.request.json()
    if (parseFn) return parseFn(json)
    return json
  } catch (e) {
    const formData = await ctx.request.formData()
    return objectFromFormData(formData, parseFn)
  }
}

export { objFromCtx }
