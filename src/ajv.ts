import * as Ajv from "ajv";
import * as _ from "lodash";

// @todo find more general way to handle oneOf/anyOf keywords
// @see https://github.com/ajv-validator/ajv/issues/1231#issuecomment-652227222
function usePatchedAjv() {
  const ajvInstance = new Ajv({
    allErrors: true,
    async: false,
    coerceTypes: true,
    removeAdditional: "all",
  });

  ajvInstance.removeKeyword("oneOf");
  ajvInstance.addKeyword("oneOf", {
    compile: (schemas) => (data) => {
      for (const schema of schemas) {
        const validator = ajv.compile(schema);
        const valid = validator(_.cloneDeep(data));

        if (valid) {
          validator(data);
          return valid;
        }
      }
      return false;
    },
    modifying: true,
    metaSchema: {
      type: "array",
      items: [{ type: "object" }],
    },
    errors: false,
  });

  return ajvInstance;
}

export const ajv = usePatchedAjv();
