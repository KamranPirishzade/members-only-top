import { DatabaseError } from "pg";

const MAX_POSTGRES_INTEGER = 2147483647;

function isUniqueViolationError(err: unknown): boolean {
  return err instanceof DatabaseError && err.code === "23505";
}

function parseId(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const id = Number(value);
  return id > 0 && id <= MAX_POSTGRES_INTEGER ? id : undefined;
}

export { isUniqueViolationError, parseId };
