import type { DataFunctionArgs } from "@remix-run/server-runtime"
import { obj_from_fd } from "../common/common-helpers"

export const obj_from_ctx = async (ctx: DataFunctionArgs) => {
  if (ctx.request.method === "GET") {
    return ctx.params
  }

  const fd = await ctx.request.formData()
  return obj_from_fd(fd)
}
