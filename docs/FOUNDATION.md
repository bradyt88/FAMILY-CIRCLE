# Family Circle Foundation

## Purpose

This document defines the foundation that must be in place before Family Circle is treated as a deployable application.

## Product flow

The first core journey is:

1. Family access/setup
2. Family member selection
3. PIN modal appears on the member-selection screen
4. Correct PIN unlocks that member
5. Family Home opens

The PIN interaction is a modal on the same screen. It is not a separate navigation page.

## Foundation requirements

- Mobile-first responsive application
- Reusable component structure
- Centralised design tokens/styles
- No real personal family data hard-coded into source
- Environment variables for runtime configuration
- Clear separation between UI, domain logic and backend services
- Backend access designed around least privilege and row-level security
- Automated build/test checks before merging to `main`
- Netlify deployment only after the application foundation passes validation

## Technology decisions

### Application

React + TypeScript + Vite.

### Backend

Supabase is the planned backend boundary. The application must not depend on a live Supabase project until the data model, access model and security rules have been reviewed.

### Hosting

Netlify is the planned deployment target. GitHub remains the source of truth.

## Data principle

Names, PINs, family relationships, messages and other personal information must be runtime data. Development fixtures should use clearly synthetic values.

## Definition of foundation complete

Foundation is complete when:

- the repository structure is established;
- the application starts and builds cleanly;
- the core navigation flow is represented;
- design assets are separated into active and archived references;
- security boundaries are documented;
- backend integration points are defined without exposing secrets;
- automated checks are present; and
- the changes have been reviewed before merging into `main`.
