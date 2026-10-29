# Waitlist backend

## Endpoint

`POST /api/v1/waitlist` accepts JSON using the existing form's field names:

```json
{
  "fullName": "Test User",
  "email": "user@example.test",
  "country": "",
  "chatterTag": "",
  "interests": ["Direct messaging", "Contacts"],
  "source": "",
  "consent": true,
  "website": ""
}
```

`website` is a honeypot field and must remain empty. The form sends the same approved
feature labels and referral source options that it displays. There is no `top_features`
request field; selected features are stored in their original order in `features`.

The server validates a trimmed full name (1-120 characters), a valid email address
(maximum 254 characters), an optional listed country, an optional 3-30 character
ChatterTag using letters/numbers/dot/underscore/hyphen, up to three distinct approved
feature labels, an optional listed referral source, and strict `consent: true`.
Unexpected request properties and malformed input are rejected. The complete JSON
body is limited to 8 KiB.

Successful inserts and duplicate-email requests receive the same `200` response shape
to avoid revealing whether an email already exists:

```json
{
  "ok": true,
  "message": "Thanks for your interest. Your request was received for consideration. This does not verify your email or reserve your ChatterTag."
}
```

Input errors return `400` with field-level messages. A preferred ChatterTag uniqueness
collision returns `409` without claiming availability or reservation. Other persistence
failures return a generic `503`; database details are not returned to clients.

## Data mapping

- Email is trimmed and lowercased before insert; the table's `citext` unique constraint
  remains the concurrency-safe duplicate guard.
- Empty optional country is stored as `""` to satisfy the existing `NOT NULL` column.
- Empty optional ChatterTag is stored as `""`; `tag_normalized` receives a random
  `request:<uuid>` sentinel solely to satisfy the existing non-null unique constraint.
  This sentinel is not a ChatterTag and is never shown to the user.
- A supplied ChatterTag is trimmed, normalized to lowercase without one leading `@`,
  and stored as a request only. The server does not assign an alternative.
- Consent must be the boolean `true`. `consent_at` is set from server time after
  validation; client timestamps are rejected. `email_verified_at` is explicitly null.
- `top_features` is omitted so its database default applies; no ranking behavior is
  inferred.

## Configuration

Set these server-only variables in the deployment environment or an ignored
`frontend/.env.local` file:

- `SUPABASE_URL`: project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role secret, server-only.

Never prefix either with `NEXT_PUBLIC_`. The server helper disables client session
persistence and is marked server-only. No Supabase credentials are needed in browser
code.

RLS must remain enabled with no public `INSERT` or `SELECT` policies. The API route
uses the service-role key from the server. Do not expose that key, disable RLS, or
grant public table access. No schema changes are part of this implementation.

## Local checks

1. Copy `.env.example` to `.env.local` and fill it locally; never commit `.env.local`.
2. Run `npm run dev` from `frontend/`.
3. Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
4. An end-to-end persistence test requires an explicitly configured non-production
   Supabase project and a test procedure that does not use real personal information.

## Production blockers and limitations

- There is no shared production rate limiter configured. The request is capped at
  8 KiB and includes a honeypot, but these do not prevent distributed abuse. Configure
  a reliable shared rate limit at the deployment edge or an approved shared service.
- The repository has no privacy notice. Before accepting real personal information in
  production, publish an approved notice describing collection, purpose, retention,
  and contact/deletion procedures.
- The optional form fields conflict with the table's `NOT NULL` constraints. This
  implementation stores empty text and a non-user-facing normalized-tag sentinel;
  confirm this mapping is acceptable before production use.
- No live persistence test is claimed unless an end-to-end test against the configured
  Supabase project has actually succeeded.
