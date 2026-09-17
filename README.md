# Family Circle

**A private, secure family hub for connection, communication and everyday organisation.**

Family Circle brings family members, plans, messages and everyday organisation together in one simple app.

## Development status

Family Circle is currently in the **Foundation** stage.

The project is being built with a GitHub-first workflow. The repository is the source of truth; deployment to Netlify and backend integration with Supabase will be introduced only after the foundation has been validated.

## Initial product direction

- Family setup and access
- Family member selection
- PIN protection for member access
- Family Home
- Mobile-first interface
- Privacy and security by design
- Configurable family data rather than hard-coded personal details

## Design

**Approved logo: Option #11.**

The approved brand assets live under `design/brand/`. Exploratory logo concepts are kept under `design/archive/` for reference only and must not be used by the application.

## Planned technology boundary

- **GitHub** — source control, documentation and development workflow
- **React + TypeScript + Vite** — application layer
- **Supabase** — planned backend for authentication, database and storage where required
- **Netlify** — planned deployment and browser-based beta hosting

## Development principles

1. Build the foundation before deployment.
2. Keep active assets separate from archived references.
3. Never hard-code real family information into the application.
4. Keep secrets out of source control and client-side code.
5. Treat privacy and access control as core product requirements, not later additions.
6. Every meaningful change should be testable and reviewable.
