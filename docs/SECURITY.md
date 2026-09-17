# Family Circle Security Baseline

Security is part of the product foundation.

## Rules

- Never commit secrets, API keys or service-role credentials.
- Never use real family information as source-code fixtures.
- Treat PINs as sensitive authentication material; do not store plaintext PINs in a database.
- Backend authorisation must be enforced server-side, not only by hiding UI elements.
- Supabase tables exposed to the client must use appropriate Row Level Security policies.
- The client must use only credentials/configuration intended for client-side use.
- Do not place privileged Supabase operations in browser code.
- Validate input at trust boundaries.
- Keep personal data collection to what the product actually needs.

## PIN design

The member PIN is an access mechanism, not merely a visual lock. The eventual implementation must use a secure verification flow and protect against trivial enumeration/brute-force behaviour.

The exact PIN storage and verification design will be finalised before backend implementation.

## Testing

Security-sensitive flows must have tests covering at minimum:

- correct access;
- incorrect PIN;
- locked/invalid member state;
- unauthorised data access; and
- session/access expiry behaviour once authentication is implemented.
