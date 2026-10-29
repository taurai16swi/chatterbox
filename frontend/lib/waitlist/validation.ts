import { randomUUID } from "node:crypto";
import {
  WAITLIST_COUNTRIES,
  WAITLIST_FEATURES,
  WAITLIST_REFERRAL_SOURCES,
  type WaitlistField,
} from "./contract.ts";

const allowedKeys = new Set([
  "fullName",
  "email",
  "country",
  "chatterTag",
  "interests",
  "source",
  "consent",
  "website",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const chatterTagPattern = /^[a-z0-9._-]{3,30}$/;

export type ValidatedWaitlistSubmission = {
  fullName: string;
  email: string;
  country: string;
  chatterTag: string;
  normalizedTag: string;
  interests: string[];
  source: string | null;
  consentAt: string;
};

export type WaitlistValidationResult =
  | { ok: true; value: ValidatedWaitlistSubmission }
  | {
      ok: false;
      message: string;
      fields: Partial<Record<WaitlistField, string>>;
    }
  | { ok: false; kind: "honeypot"; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(
  value: string,
  options: T,
): value is T[number] {
  return options.some((option) => option === value);
}

function normalizeTag(value: string): string {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export function validateWaitlistSubmission(
  input: unknown,
  now: () => Date = () => new Date(),
): WaitlistValidationResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      message: "Please check your form details and try again.",
      fields: {},
    };
  }

  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    return {
      ok: false,
      message: "The request contains unsupported fields.",
      fields: {},
    };
  }

  const fields: Partial<Record<WaitlistField, string>> = {};
  const fullName = typeof input.fullName === "string" ? input.fullName.trim().replace(/\s+/g, " ") : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const country = typeof input.country === "string" ? input.country.trim() : "";
  const chatterTag = typeof input.chatterTag === "string" ? input.chatterTag.trim() : "";
  const source = typeof input.source === "string" ? input.source.trim() : "";
  const interests = input.interests;
  const selectedFeatures = Array.isArray(interests)
    ? interests.filter((feature): feature is string => typeof feature === "string")
    : [];
  const website = input.website;

  if (typeof input.fullName !== "string" || fullName.length === 0) {
    fields.fullName = "Please enter your full name.";
  } else if (fullName.length > 120) {
    fields.fullName = "Your name must be 120 characters or fewer.";
  }

  if (typeof input.email !== "string" || email.length === 0) {
    fields.email = "Email address is required.";
  } else if (email.length > 254 || !emailPattern.test(email)) {
    fields.email = "Please enter a valid email address.";
  }

  if (typeof input.country !== "string" || country.length > 80) {
    fields.country = "Please choose a valid country.";
  } else if (country !== "" && !isOneOf(country, WAITLIST_COUNTRIES)) {
    fields.country = "Please choose a country from the list.";
  }

  const normalizedTag = typeof input.chatterTag === "string" ? normalizeTag(chatterTag) : "";
  if (typeof input.chatterTag !== "string" || normalizedTag.length > 30) {
    fields.chatterTag = "Your preferred ChatterTag must be 30 characters or fewer.";
  } else if (normalizedTag !== "" && !chatterTagPattern.test(normalizedTag)) {
    fields.chatterTag = "Use 3–30 letters, numbers, dots, underscores or hyphens.";
  }

  if (!Array.isArray(interests) || interests.length > 3) {
    fields.interests = "Choose up to three features.";
  } else if (
    interests.some(
      (feature) =>
        typeof feature !== "string" || !isOneOf(feature, WAITLIST_FEATURES),
    ) ||
    new Set(interests).size !== interests.length
  ) {
    fields.interests = "Choose valid features from the list.";
  }

  if (typeof input.source !== "string" || source.length > 80) {
    fields.source = "Please choose a valid referral source.";
  } else if (source !== "" && !isOneOf(source, WAITLIST_REFERRAL_SOURCES)) {
    fields.source = "Please choose a referral source from the list.";
  }

  if (input.consent !== true) {
    fields.consent = "Consent is required to submit this request.";
  }

  if (typeof website !== "string" || website.length > 200) {
    return {
      ok: false,
      message: "Please check your form details and try again.",
      fields: {},
    };
  }

  if (website.trim() !== "") {
    return {
      ok: false,
      kind: "honeypot",
      message: "Please check your form details and try again.",
    };
  }

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fields,
    };
  }

  const timestamp = now();

  return {
    ok: true,
    value: {
      fullName,
      email,
      country,
      chatterTag,
      normalizedTag: normalizedTag || `request:${randomUUID()}`,
      interests: selectedFeatures,
      source: source || null,
      consentAt: timestamp.toISOString(),
    },
  };
}

export type WaitlistInsert = {
  full_name: string;
  email: string;
  country: string;
  chatter_tag: string;
  tag_normalized: string;
  features: string[];
  referral_source: string | null;
  consent_at: string;
  email_verified_at: null;
};

export function toWaitlistInsert(
  submission: ValidatedWaitlistSubmission,
): WaitlistInsert {
  return {
    full_name: submission.fullName,
    email: submission.email,
    country: submission.country,
    chatter_tag: submission.chatterTag,
    tag_normalized: submission.normalizedTag,
    features: submission.interests,
    referral_source: submission.source,
    consent_at: submission.consentAt,
    email_verified_at: null,
  };
}
