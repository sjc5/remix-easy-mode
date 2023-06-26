import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { obj_from_fd } from "@kiruna/form-data"

async function obj_from_ctx(
  ctx: DataFunctionArgs,
  parse_fn?: (input: string) => unknown
) {
  if (ctx.request.method === "GET") {
    return ctx.params
  }
  const fd = await ctx.request.formData()
  return obj_from_fd(fd, parse_fn)
}

export { obj_from_ctx }
