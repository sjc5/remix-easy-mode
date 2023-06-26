import type { ZodEnumDef, ZodNativeEnumDef, ZodTypeDef, ZodUnionDef } from "zod"

type TargetRadioZodDefs = ZodUnionDef | ZodEnumDef | ZodNativeEnumDef

function optionsFromZodShapeDef(zodTypeDef: ZodTypeDef | undefined) {
  try {
    if (
      typeof zodTypeDef !== "object" ||
      !zodTypeDefHasTypeNameProp(zodTypeDef)
    ) {
      return
    }

    if (isZodUnionDef(zodTypeDef)) {
      return zodTypeDef.options.map((x) => x._def.value)
    }

    if (isZodEnumDef(zodTypeDef)) {
      return zodTypeDef.values
    }

    if (isZodNativeEnumDef(zodTypeDef)) {
      return Object.values(zodTypeDef?.values)
    }
  } catch (ignore) {
    console.error("Error in optionsFromZodShapeDef.")
  }
}

export { optionsFromZodShapeDef }

function zodTypeDefHasTypeNameProp(
  x: ZodTypeDef & {
    typeName?: string
  }
): x is TargetRadioZodDefs {
  return !!x?.typeName
}

function isZodUnionDef(x: TargetRadioZodDefs): x is ZodUnionDef {
  return x.typeName === "ZodUnion"
}

function isZodEnumDef(x: TargetRadioZodDefs): x is ZodEnumDef {
  return x.typeName === "ZodEnum"
}

function isZodNativeEnumDef(x: TargetRadioZodDefs): x is ZodNativeEnumDef {
  return x.typeName === "ZodNativeEnum"
}
