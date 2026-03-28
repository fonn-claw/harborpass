---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (via next.js integration) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01..04 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | SLIP-01, SLIP-02, SLIP-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | DEMO-01..05 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | DSGN-01..05, DSGN-07 | manual | visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@vitejs/plugin-react` — test framework installation
- [ ] `vitest.config.ts` — configuration with path aliases
- [ ] Test stubs for auth flow, schema validation, seed data verification

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login screen shows hero-marina.png | DSGN-05 | Visual/layout verification | Open /login, verify full-bleed background image |
| Dispatch board layout (no sidebar) | DSGN-01 | Visual/layout verification | Log in as staff, verify no sidebar/tabs |
| Correct fonts render | DSGN-03 | Typography verification | Inspect elements for DM Sans, Inter, JetBrains Mono |
| Design spec colors applied | DSGN-02 | Visual verification | Verify navy top bar, sand background |
| SVG assets render | DSGN-04 | Visual verification | Verify logo.svg in top bar, icons render |
| Responsive design | DSGN-07 | Visual verification | Resize browser to mobile/tablet widths |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
