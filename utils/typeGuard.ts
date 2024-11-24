// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isFunction = (arg: unknown): arg is Function =>
  typeof arg === "function";
