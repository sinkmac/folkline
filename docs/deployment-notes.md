# Folkline deploy notes

Environment variables required for production:
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL

Optional:
- PUBLIC_PLAUSIBLE_DOMAIN
- PUBLIC_PLAUSIBLE_SRC

Truth boundaries:
- AI generation required only for Prepare
- final summary is deterministic/local
- print/save-as-PDF is browser-side
- email sends HTML + plain text summary only
- no PDF attachment is promised in V1

Production checks:
1. Homepage loads and CTA reaches /interview
2. Prepare form generates a valid guide with live Anthropic key
3. Conduct view prints cleanly
4. Capture autosaves across refresh
5. Receive summary renders with partial and full notes
6. Email send succeeds with live Resend config
7. About and Privacy pages are reachable
8. No console errors on core flow
