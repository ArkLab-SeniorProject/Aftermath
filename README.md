# Senior Project

Base web application for the senior project. Built with a Vite + React + TypeScript frontend using Material UI, and a Node.js + GraphQL + MongoDB backend.

## Structure

- `data-access/` — GraphQL API and MongoDB data layer
- `ui/` — User-facing web application

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your MongoDB credentials (`DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_APP_NAME`) and a long random `AUTH_SECRET` used to sign authentication tokens. The `DB_NAME` defaults to `senior-project`.

Every account created through signup is assigned `role: "user"`. Resource mutations are restricted to users whose MongoDB document has `role: "admin"`. Set `role: "user"` for normal accounts, and grant `"admin"` only to trusted resource administrators. Do not expose role assignment through the public signup or profile-update inputs.

The `users` collection stores the role as a required application field with the values `"user"` or `"admin"`.

3. Start the backend and frontend (in separate terminals):

```bash
npm run dev -w data-access
npm run dev -w ui
```

The frontend dev server proxies `/graphql` to the backend at `http://localhost:7071`.

## Build

```bash
npm run build
```

`prebuild` automatically runs `format:check` and `lint:check` to catch issues before TypeScript/Vite run.

## Formatting and linting

This project uses [Biome](https://biomejs.dev/) for formatting and linting.

```bash
npm run format        # format all files
npm run format:check  # check formatting without writing
npm run lint          # lint and auto-fix issues
npm run lint:check    # lint without writing
npm run check         # format + lint with auto-fix
npm run check:ci      # format + lint checks for CI
```
