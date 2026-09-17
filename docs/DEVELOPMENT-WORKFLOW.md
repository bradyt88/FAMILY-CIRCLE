# Family Circle Development Workflow

## Source of truth

GitHub is the source of truth.

## Change flow

```text
Feature/change
   ↓
Working branch
   ↓
Build + tests
   ↓
Review
   ↓
Pull request
   ↓
main
   ↓
Netlify deployment when appropriate
```

Do not use `main` as the experimental development branch.

## Phase discipline

Do not add production backend dependencies simply because a screen can be mocked without them. First define the requirement, data boundary and security model; then integrate the required service.

## Validation gates

A change is not considered complete until:

- the application builds from a clean checkout;
- relevant tests pass;
- no secrets are introduced;
- active design assets are used correctly; and
- the change remains consistent with the product specification.
