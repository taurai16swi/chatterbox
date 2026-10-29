import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/admin";
import { classifyWaitlistInsertError } from "@/lib/waitlist/persistence";
import {
  toWaitlistInsert,
  validateWaitlistSubmission,
} from "@/lib/waitlist/validation";

const MAX_BODY_BYTES = 8 * 1024;
const ACCEPTED_MESSAGE =
  "Thanks for your interest. Your request was received for consideration. This does not verify your email or reserve your ChatterTag.";

class PayloadTooLargeError extends Error {}

async function readBoundedBody(request: Request): Promise<string> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength < 0) {
      throw new Error("Invalid Content-Length.");
    }
    if (declaredLength > MAX_BODY_BYTES) {
      throw new PayloadTooLargeError();
    }
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(body);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { ok: false, error: "UNSUPPORTED_MEDIA_TYPE", message: "Send the request as JSON." },
      { status: 415 },
    );
  }

  let rawBody: string;
  try {
    rawBody = await readBoundedBody(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { ok: false, error: "PAYLOAD_TOO_LARGE", message: "The request is too large." },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "INVALID_REQUEST", message: "Please check your request and try again." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON", message: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validation = validateWaitlistSubmission(body);
  if (!validation.ok) {
    if ("kind" in validation) {
      return NextResponse.json(
        { ok: false, error: "INVALID_REQUEST", message: validation.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_INPUT",
        message: validation.message,
        fields: validation.fields,
      },
      { status: 400 },
    );
  }

  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      console.error("Waitlist Supabase configuration error.", {
        category: "environment_validation",
        missingVariables: error.missingVariables,
      });
    } else {
      console.error("Waitlist Supabase client initialization failed.", {
        category: "client_initialization",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "SERVICE_UNAVAILABLE",
        message: "We could not submit your request right now. Please try again later.",
      },
      { status: 503 },
    );
  }

  let error;
  try {
    ({ error } = await supabase
      .from("waitlist_signups")
      .insert(toWaitlistInsert(validation.value)));
  } catch {
    console.error("Waitlist database request failed.", {
      category: "database_request",
    });
    return NextResponse.json(
      {
        ok: false,
        error: "SERVICE_UNAVAILABLE",
        message: "We could not submit your request right now. Please try again later.",
      },
      { status: 503 },
    );
  }

  if (error) {
    const kind = classifyWaitlistInsertError(error);

    if (kind === "duplicate_email") {
      return NextResponse.json({ ok: true, message: ACCEPTED_MESSAGE });
    }

    if (kind === "tag_collision") {
      return NextResponse.json(
        {
          ok: false,
          error: "TAG_REQUEST_CONFLICT",
          message:
            "We could not record that preferred ChatterTag request. It is not reserved; remove it or choose another preference and try again.",
        },
        { status: 409 },
      );
    }

    if (kind === "unique_conflict") {
      return NextResponse.json(
        {
          ok: false,
          error: "REQUEST_CONFLICT",
          message:
            "We could not accept this request. Please review your details and try again.",
        },
        { status: 409 },
      );
    }

    console.error("Waitlist database insert returned an error.", {
      category: "database_insert",
      code: error.code,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "SERVICE_UNAVAILABLE",
        message: "We could not submit your request right now. Please try again later.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, message: ACCEPTED_MESSAGE });
}
