---
phase: 2
slug: dispatch-board-check-in
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | npm run build + grep verification (UI-heavy phase — formal tests deferred) |
| **Config file** | N/A |
| **Quick run command** | `npm run build 2>&1 \| tail -5` |
| **Full suite command** | `npm run build 2>&1 \| tail -10` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build 2>&1 | tail -5`
- **After every plan wave:** Run `npm run build 2>&1 | tail -10`
- **Before `/gsd:verify-work`:** Build must succeed
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-T1 | 01 | 1 | BOARD-01, BOARD-02 | grep+build | `grep "Arriving Today" src/components/board/*.tsx && npm run build 2>&1 \| tail -5` | ⬜ pending |
| 02-01-T2 | 01 | 1 | BOARD-03, BOARD-04 | grep+build | `grep "dock-strip" src/components/board/*.tsx && npm run build 2>&1 \| tail -5` | ⬜ pending |
| 02-02-T1 | 02 | 2 | CHKIN-01, CHKIN-02 | grep+build | `grep "CheckInWizard" src/components/check-in/*.tsx && npm run build 2>&1 \| tail -5` | ⬜ pending |
| 02-02-T2 | 02 | 2 | CHKIN-03, SLIP-03 | grep+build | `grep "maxLoa" src/components/check-in/*.tsx && npm run build 2>&1 \| tail -5` | ⬜ pending |
| 02-02-T3 | 02 | 2 | CHKIN-04, CHKIN-05, CHKIN-06 | grep+build | `grep "generateGateCode" src/lib/credentials.ts && npm run build 2>&1 \| tail -5` | ⬜ pending |
| 02-03-T1 | 03 | 3 | BOARD-05 | grep+build | `grep "revalidatePath" src/app/board/actions.ts && npm run build 2>&1 \| tail -5` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Phase 2 is UI-heavy. Primary automated verification is `npm run build` (catches type errors, import issues, RSC/client boundary violations). Visual verification is manual. No test framework setup needed for this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Three columns with correct guest grouping | BOARD-01 | Visual layout verification | Log in as staff, verify 3 columns with correct counts |
| Guest cards show all required fields | BOARD-02 | Visual content verification | Check cards for name, vessel, slip, action button, color stripe |
| Dock strip shows 20 colored blocks | BOARD-03 | Visual/color verification | Verify 20 blocks with correct color coding |
| Click dock strip opens wizard or detail | BOARD-04 | Interaction verification | Click available slip → wizard; click occupied → detail |
| Board updates after check-in | BOARD-05 | State change verification | Complete check-in, verify card moves columns |
| Wizard 3-step flow with pre-fill | CHKIN-01..06 | Multi-step interaction | Walk through full check-in for walk-up and pre-booked |
| Credentials displayed in JetBrains Mono | CHKIN-04 | Typography verification | Check font on gate code, Wi-Fi password |
| Wizard slide transitions | CONTEXT | Animation verification | Verify smooth 300ms slide between steps |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-28
