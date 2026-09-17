# Family Circle Architecture

## Layers

```text
UI (React)
  ↓
Application/domain logic
  ↓
Service boundaries
  ↓
Supabase (when integrated)
```

Netlify sits outside the application as the deployment/hosting layer.

## Repository ownership

GitHub is the canonical source of code, documentation and active design references.

## Frontend

- React
- TypeScript
- Vite
- Component-based UI
- Mobile-first responsive layout

Keep business rules out of presentational components where practical. Components should consume application/domain behaviour rather than directly embedding backend logic.

## Backend boundary

Supabase is planned for:

- authentication/access management;
- relational family/application data;
- storage where required; and
- server-side capabilities where required.

The browser must only receive public configuration intended for client use. Service-role or other privileged secrets must never be bundled into the client.

## Environment configuration

Use environment variables for project configuration. Commit `.env.example` with variable names and safe placeholders only. Never commit `.env`, credentials, service-role keys or private tokens.

## Deployment boundary

Development and review happen against GitHub first. Netlify is introduced after the application can build and pass checks from a clean checkout.

## Future data architecture

The eventual data model should separate:

- families;
- family members/profiles;
- authentication identities;
- access/PIN mechanisms;
- family content; and
- audit/security records where justified.

Exact schema decisions belong in the backend design stage, not in the initial UI scaffold.
