import type { WaitlistApiResponse, WaitlistSubmission } from "./contract";

const fallbackMessage = "We could not submit your request. Please try again.";

function isApiResponse(value: unknown): value is WaitlistApiResponse {
  if (typeof value !== "object" || value === null || !("ok" in value)) {
    return false;
  }

  if (value.ok === true) {
    return "message" in value && typeof value.message === "string";
  }

  return (
    value.ok === false &&
    "message" in value &&
    typeof value.message === "string" &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export async function submitWaitlist(
  submission: WaitlistSubmission,
): Promise<WaitlistApiResponse> {
  let response: Response;

  try {
    response = await fetch("/api/v1/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
  } catch {
    throw new Error("Connection failed. Check your internet connection and try again.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (!isApiResponse(result)) {
    throw new Error(fallbackMessage);
  }

  return result;
}
