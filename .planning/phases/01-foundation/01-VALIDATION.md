---
phase: 1
slug: foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | grep + npm run build (Phase 1 is scaffolding — formal test framework deferred to Phase 2) |
| **Config file** | N/A |
| **Quick run command** | `npm run build 2>&1 | tail -5` |
| **Full suite command** | `npm run build 2>&1 | tail -10` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build 2>&1 | tail -5`
- **After every plan wave:** Run `npm run build 2>&1 | tail -10`
- **Before `/gsd:verify-work`:** Build must succeed
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | SLIP-01, SLIP-02, SLIP-04, DSGN-01..04, DSGN-07 | grep+build | `grep "color-navy" src/app/globals.css && npm run build` | ✅ | ⬜ pending |
| 01-01-T2 | 01 | 1 | DSGN-01..04, DSGN-07 | build | `npm run build 2>&1 | tail -5` | ✅ | ⬜ pending |
| 01-02-T1 | 02 | 2 | AUTH-01..04, DSGN-05 | grep+build | `grep "bcrypt.compare" src/lib/auth.ts && grep "hero-marina.png" src/app/login/page.tsx` | ✅ | ⬜ pending |
| 01-02-T2 | 02 | 2 | AUTH-03, AUTH-04 | grep+build | `npm run build 2>&1 | tail -5` | ✅ | ⬜ pending |
| 01-03-T1 | 03 | 3 | DEMO-01..05 | grep+build | `grep -c "T-" src/db/seed.ts && grep "staff@harborpass.app" src/db/seed.ts` | ✅ | ⬜ pending |
| 01-03-T2 | 03 | 3 | DEMO-01..05 | build+seed | `npm run build 2>&1 | tail -3` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 1 uses grep+build for automated verification — formal test framework (vitest) will be established when behavioral tests are needed (Phase 2+).

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-28
