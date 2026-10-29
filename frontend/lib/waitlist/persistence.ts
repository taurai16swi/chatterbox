export type InsertError = {
  code?: string;
  message?: string;
};

export type InsertErrorKind =
  | "duplicate_email"
  | "tag_collision"
  | "unique_conflict"
  | "database_error";

export function classifyWaitlistInsertError(error: InsertError): InsertErrorKind {
  if (error.code !== "23505") {
    return "database_error";
  }

  const constraintDescription = (error.message ?? "").toLowerCase();

  if (constraintDescription.includes("tag_normalized")) {
    return "tag_collision";
  }

  if (constraintDescription.includes("email")) {
    return "duplicate_email";
  }

  return "unique_conflict";
}
