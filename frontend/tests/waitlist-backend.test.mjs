import assert from "node:assert/strict";
import test from "node:test";
import {
  toWaitlistInsert,
  validateWaitlistSubmission,
} from "../lib/waitlist/validation.ts";
import { classifyWaitlistInsertError } from "../lib/waitlist/persistence.ts";
import { submitWaitlist } from "../lib/waitlist/client.ts";

const validSubmission = {
  fullName: "  Test   User ",
  email: "  USER@example.test ",
  country: "",
  chatterTag: "",
  interests: ["Direct messaging", "Contacts"],
  source: "",
  consent: true,
  website: "",
};

test("validates and normalizes submitted values and uses server time for consent", () => {
  const fixedTime = new Date("2026-01-02T03:04:05.000Z");
  const result = validateWaitlistSubmission(validSubmission, () => fixedTime);

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.value.fullName, "Test User");
  assert.equal(result.value.email, "user@example.test");
  assert.equal(result.value.normalizedTag.startsWith("request:"), true);
  assert.equal(result.value.source, null);
  assert.equal(result.value.consentAt, fixedTime.toISOString());

  const insert = toWaitlistInsert(result.value);
  assert.equal(insert.country, "");
  assert.equal(insert.chatter_tag, "");
  assert.deepEqual(insert.features, ["Direct messaging", "Contacts"]);
  assert.equal(insert.email_verified_at, null);
  assert.equal("top_features" in insert, false);
});

test("accepts Zambia as a selected country", () => {
  const result = validateWaitlistSubmission({
    ...validSubmission,
    country: "Zambia",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.country, "Zambia");
  assert.equal(toWaitlistInsert(result.value).country, "Zambia");
});

test("normalizes a preferred tag without assigning or reserving it", () => {
  const result = validateWaitlistSubmission({
    ...validSubmission,
    chatterTag: " @Sample_Tag ",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.chatterTag, "@Sample_Tag");
  assert.equal(result.value.normalizedTag, "sample_tag");
});

test("requires strict boolean consent and rejects client timestamps", () => {
  const result = validateWaitlistSubmission({
    ...validSubmission,
    consent: "true",
  });

  assert.equal(result.ok, false);
  if (result.ok || "kind" in result) return;
  assert.match(result.fields.consent ?? "", /Consent is required/);

  const timestamp = validateWaitlistSubmission({
    ...validSubmission,
    consentAt: "2020-01-01",
  });
  assert.equal(timestamp.ok, false);
  assert.equal(timestamp.ok || "kind" in timestamp, false);
});

test("rejects unknown feature values and more than three selections", () => {
  const unknown = validateWaitlistSubmission({
    ...validSubmission,
    interests: ["Unapproved feature"],
  });
  assert.equal(unknown.ok, false);

  const tooMany = validateWaitlistSubmission({
    ...validSubmission,
    interests: ["Direct messaging", "Contacts", "ChatterTags", "Home feed"],
  });
  assert.equal(tooMany.ok, false);
});

test("rejects unexpected request properties and a filled honeypot", () => {
  const unexpected = validateWaitlistSubmission({
    ...validSubmission,
    top_features: ["Contacts"],
  });
  assert.equal(unexpected.ok, false);

  const honeypot = validateWaitlistSubmission({
    ...validSubmission,
    website: "bot-filled",
  });
  assert.equal(honeypot.ok, false);
  assert.equal("kind" in honeypot && honeypot.kind === "honeypot", true);
});

test("classifies email and tag uniqueness errors without exposing database details", () => {
  assert.equal(
    classifyWaitlistInsertError({
      code: "23505",
      message: 'duplicate key violates unique constraint "waitlist_signups_email_key"',
    }),
    "duplicate_email",
  );
  assert.equal(
    classifyWaitlistInsertError({
      code: "23505",
      message: 'duplicate key violates unique constraint "waitlist_signups_tag_normalized_key"',
    }),
    "tag_collision",
  );
  assert.equal(
    classifyWaitlistInsertError({ code: "23505", message: "unknown unique constraint" }),
    "unique_conflict",
  );
  assert.equal(
    classifyWaitlistInsertError({ code: "08006", message: "connection failed" }),
    "database_error",
  );
});

test("turns network failures into a user-safe submission error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("network detail");
  };

  try {
    await assert.rejects(
      submitWaitlist({
        ...validSubmission,
        fullName: "Test User",
        email: "user@example.test",
      }),
      /Connection failed/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns structured API errors without swallowing the server message", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        ok: false,
        error: "TAG_REQUEST_CONFLICT",
        message: "The ChatterTag request could not be recorded.",
      }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );

  try {
    const result = await submitWaitlist({
      ...validSubmission,
      fullName: "Test User",
      email: "user@example.test",
    });

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "TAG_REQUEST_CONFLICT");
    assert.equal(result.message, "The ChatterTag request could not be recorded.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
