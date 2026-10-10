# QuoteGuard AI

Procurement RFQ-to-Quote hackathon demo. The catalog is fictional/demo data. This is not production procurement software.

## Project structure
- React/Vite frontend at the repository root
- Express/TypeScript backend in `server/`

## Requirements
Node.js 20+ and pnpm.

## Install
At the project root run `pnpm install`. Then run `cd server && pnpm install`.

## Configure
Create `.env` at the root with `VITE_API_BASE_URL=http://localhost:8787`.
Create `server/.env` with `PORT=8787`, `CORS_ORIGIN=http://localhost:5173`, `NICRRON_API_KEY=`, `NICRRON_BASE_URL=https://api.nicrron.ai/v1`, `NICRRON_MODEL=nicrron/auto`, `PRISMTRACE_HOST=https://prism.blockconvey.com`, `PRISMTRACE_PROJECT_ID=`, and `PRISMTRACE_API_KEY=`. Do not commit real keys.

## Run
Terminal 1 (root): `pnpm dev`
Terminal 2: `cd server && pnpm dev`

## Verify
Run `pnpm typecheck && pnpm build` at root. In `server/`, run `pnpm typecheck && pnpm build`. Check `http://localhost:8787/health`.

## Integration status
Nicrron requires a real key and API compatibility check. PRISM adapter is a scaffold and does not claim to submit traces or configure Guardrails/Evaluators/Knowledge Base until the documented API has been verified. Do not claim those integrations are live unless tested.
