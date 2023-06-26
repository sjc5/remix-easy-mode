import type { ZodEnumDef, ZodNativeEnumDef, ZodUnionDef } from "zod"

// This stinks. How can we do it better?
function optionsFromZodShapeDef(
  zodShapeDef: ZodUnionDef | ZodEnumDef | ZodNativeEnumDef
) {
  try {
    if (typeof zodShapeDef !== "object") return

    function isZodUnionDef(
      x: ZodUnionDef | ZodEnumDef | ZodNativeEnumDef
    ): x is ZodUnionDef {
      return x.typeName === "ZodUnion"
    }

    if (isZodUnionDef(zodShapeDef)) {
      return zodShapeDef.options.map((x: any) => x._def.value)
    }

    function isZodEnumDef(
      x: ZodUnionDef | ZodEnumDef | ZodNativeEnumDef
    ): x is ZodEnumDef {
      return x?.typeName === "ZodEnum"
    }

    if (isZodEnumDef(zodShapeDef)) {
      return zodShapeDef.values
    }

    function isZodNativeEnumDef(
      x: ZodUnionDef | ZodEnumDef | ZodNativeEnumDef
    ): x is ZodNativeEnumDef {
      return x?.typeName === "ZodNativeEnum"
    }

    if (isZodNativeEnumDef(zodShapeDef)) {
      return Object.values(zodShapeDef?.values)
    }
  } catch (ignore) {}
}

export { optionsFromZodShapeDef }
