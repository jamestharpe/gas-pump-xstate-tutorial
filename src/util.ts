/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
export function mergeDeep(parent, ...objects: Object[]) {
  const isObject = (obj: any) => obj && typeof obj === "object";

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(key, pVal, oVal);
      } else {
        if (prev[key]) {
          throw new Error(
            `Object merge conflict on "${parent}.${key}" property!`
          );
        }
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}
