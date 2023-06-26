import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { obj_from_fd as objectFromFormData } from "@kiruna/form-data"

async function objFromCtx(
  ctx: DataFunctionArgs,
  parseFn?: (input: string) => unknown
) {
  if (ctx.request.method === "GET") {
    return ctx.params
  }
  const fd = await ctx.request.formData()
  return objectFromFormData(fd, parseFn)
}

export { objFromCtx }
