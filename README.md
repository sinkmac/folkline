# Folkline

Folkline is a practical interview kit for families who want to ask better questions and keep what they hear.

Current status
- Phase 1: shell and session model complete
- Phase 2: constrained AI question generation complete
- Phase 3: conduct view and print artifact complete
- Phase 4: capture flow with autosave complete
- Phase 5: deterministic receive summary complete
- Phase 6: transactional email delivery complete
- Phase 7: analytics hook, deploy docs, and hardening complete

Local run
1. Copy `.env.example` to `.env`
2. Fill the required keys
3. Run `npm install`
4. Run `npm run dev`

Required env
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL

Optional env
- PUBLIC_PLAUSIBLE_DOMAIN
- PUBLIC_PLAUSIBLE_SRC

Core product laws
- no accounts
- no server-side note storage
- localStorage session persistence only
- deterministic summary in V1
- browser print-to-PDF baseline
- one-shot transactional email only
