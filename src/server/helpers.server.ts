import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { obj_from_fd } from "@kiruna/form-data"

export const obj_from_ctx = async (
  ctx: DataFunctionArgs,
  parse_fn?: (input: string) => unknown
) => {
  if (ctx.request.method === "GET") {
    return ctx.params
  }
  const fd = await ctx.request.formData()
  return obj_from_fd(fd, parse_fn)
}
