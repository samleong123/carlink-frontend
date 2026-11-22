import type { Field } from "../components/workflow";
import { object, type Row } from "./types";

function put(target: Row, name: string, value: unknown) {
  const parts = name.split(".");
  let node = target;
  for (const key of parts.slice(0, -1)) {
    node[key] = object(node[key]);
    node = node[key] as Row;
  }
  node[parts.at(-1)!] = value;
}
function get(source: Row, name: string) {
  return name
    .split(".")
    .reduce<unknown>((node, key) => object(node)[key], source);
}
export function curatedFields(values: Row, fields: Field[]): Row {
  const payload: Row = {};
  for (const spec of fields) {
    const value = get(values, spec.name);
    if (spec.nullable && (value === undefined || value === "")) {
      put(payload, spec.name, null);
      continue;
    }
    if (
      value === undefined ||
      (value === null && !spec.nullable) ||
      (value === "" && !spec.required && !spec.nullable)
    )
      continue;
    put(payload, spec.name, value);
  }
  return payload;
}
export function fieldInitialValues(initial: Row, fields: Field[]): Row {
  const result: Row = {};
  for (const spec of fields) {
    const value = get(initial, spec.name) ?? spec.default;
    if (value !== undefined)
      put(
        result,
        spec.name,
        spec.kind === "switch" ? value === true || value === 1 : value,
      );
  }
  return result;
}
export function logicalAttempt(
  previous: { payload: string; key: string } | null,
  body: unknown,
  uncertain = false,
) {
  const payload = JSON.stringify(body);
  if (uncertain && previous && previous.payload !== payload)
    throw new Error(
      "The previous outcome is uncertain. Retry only the unchanged payload and key, or reconcile with an operator before starting a different operation.",
    );
  return previous?.payload === payload
    ? previous
    : { payload, key: crypto.randomUUID() };
}
