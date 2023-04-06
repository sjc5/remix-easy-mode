import { useLoaderData } from "@remix-run/react"
import { prep_loader_res } from "../common/common-helpers"

export const useDeserializeLoaderData = <L extends (...args: any) => any>() => {
  const data = useLoaderData()

  return prep_loader_res<L>({
    stringified_res: data,
  })
}
