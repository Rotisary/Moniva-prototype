# AGENTS.md

Instructions for AI coding agents working in this project.

Do not add AI attribution to commits or pull requests, including AI
`Co-Authored-By` trailers or generated-by signatures. Preserve genuine human
attribution.

## What this is

**Moniva** is an interactive hackathon prototype for social commerce
intelligence and financial inclusion. It turns a Nigerian SME's WhatsApp and
Instagram selling activity into structured business records, reconciled
payments, financial analytics, and a merchant financial profile that the
merchant can share with financial institutions, with consent.
The demo merchant is Tolu Fashion House, a Lagos fashion business.

It is a client-only prototype. All data is a seeded mock dataset persisted to
`localStorage`. Every social, bank, and sharing integration is simulated and
labelled as such. There is no backend, auth, payment processing, or LLM API.

## Build priorities

These apply to every feature in this project:

1. Build the Overview dashboard and the Social Commerce page first. Making it work
   matters more than slick architecture. Don't spend time perfecting the
   structure.
2. Use one consistent seeded dataset throughout. Every metric must be calculated
   from, and agree with, the underlying records. Never hardcode metric values.
3. Make the demo interactive: a reviewer clicking through must see state change.
4. Don't install unnecessary dependencies or add external services.
5. Never sacrifice the Financial Profile and data-sharing workflow for optional
   features (Financial Insights, Repeat Customers).
6. Show money in NGN (₦). Never call the health overview a credit score or imply
   Moniva approves loans.

## Stack

- React 19 + TypeScript, bundled with Vite (client-side SPA, no SSR)
- Routing: React Router (`react-router-dom`)
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first config in
  `src/index.css`
- UI: shadcn/ui (`base-nova` style on Base UI) in `src/components/ui/`, icons
  from `lucide-react`
- Forms and validation: React Hook Form + Zod
- Charts: Recharts. Dates: date-fns. Toasts: Sonner. Theme: next-themes
- Package manager: npm (`package-lock.json`)
- Import alias: `@/` maps to `src/`

## Proportional engineering

Build for established requirements, not hypothetical scale, threats, or future
flexibility. Reuse existing code, the standard library, native platform features,
and installed dependencies before adding machinery.

- Unknown scale or extensibility defaults to the smaller reversible design. Do
  not infer enterprise, multi-tenant, hostile-user, or compliance requirements.
- Derive trust and data-integrity boundaries from actual reachability: untrusted
  input, auth/session/ownership, shared persisted data, destructive operations,
  payments, secrets, and sensitive data.
- Ask only when an unknown materially changes behavior, architecture, persisted
  data, interoperability, a real security boundary, or cost. Otherwise choose the
  simplest repository-native implementation.
- Add an abstraction, dependency, service, configuration surface, compatibility
  layer, or security mechanism only for a current requirement.
- Simplicity never removes real trust-boundary validation, data-loss prevention,
  accessibility, explicit security requirements, configured tests, or project rules.

## Conventions

- Functional components and hooks only; strict TypeScript, no `any`.
- Add shadcn/ui components with the shadcn CLI rather than hand-writing
  primitives; keep them in `src/components/ui/`.
- Style with Tailwind utility classes; theme tokens live in `src/index.css`.
- Validate user input with Zod schemas.
- Comment the why, not the what. No em dashes in generated prose.

## Commands

- Dev server: `npm run dev` (http://localhost:5173)
- Build: `npm run build` (runs `tsc -b` typecheck, then `vite build`)
- Preview production build: `npm run preview`
- Lint: `npm run lint`

No test command is configured, so tests are not a required gate yet. Verify
logic with the build, lint, and running the app until a test runner is added.
