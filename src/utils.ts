import { DatabaseError } from "pg";

function isUniqueViolationError(err: unknown): boolean {
  return err instanceof DatabaseError && err.code === "23505";
}

export { isUniqueViolationError };
