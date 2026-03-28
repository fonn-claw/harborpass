# AGENTS.md — Build Instructions

## Context
This is a FonnIT daily build project.
- Read BRIEF.md for the domain, users, and what they need.
- Read DESIGN-SPEC.md for the MANDATORY visual identity, UI paradigm, and layout.

## CRITICAL: Follow the Design Spec
DESIGN-SPEC.md defines:
- **UI Paradigm** — the type of app this is (not always an admin panel)
- **Layout Structure** — how the screen is organized (not always sidebar + content)
- **Anti-patterns** — what NOT to do for this specific app
- **Colors, typography, components, motion** — follow exactly

These override your defaults. If the spec says split-view, build split-view.
If it says no sidebar, don't build a sidebar. If it says kanban, build kanban.
Do NOT fall back to a standard admin panel layout unless the spec asks for one.

## CRITICAL: Single-Session Build
Complete the ENTIRE app in this single session. Do NOT stop between phases.
Do NOT suggest `/clear` or context resets. Auto-advance through all phases.
Make ALL domain decisions yourself — reasonable defaults, don't block on questions.

## MANDATORY: GSD Methodology
GSD is REQUIRED. Never skip it. Never "just code it directly."

Use GSD for the full build lifecycle:
1. Initialize: /gsd:new-project --auto @BRIEF.md (use all recommended defaults)
2. For EACH phase: discuss → ui-spec (if frontend) → plan → execute → verify
3. Auto-advance through ALL phases without human intervention
4. After all phases: /gsd:ship

## Standards
- Demo data seeded and realistic
- Build must pass before handoff
- Responsive design
- Database: Neon Postgres (NOT SQLite)
- Pre-generated assets in public/assets/ must be used as documented in DESIGN-SPEC.md

## Deploy
When finished, push to GitHub and deploy to Vercel:
- git remote add origin https://github.com/fonn-claw/harborpass.git
- git push -u origin main
- npx vercel --yes && npx vercel domains add harborpass.demos.fonnit.com && npx vercel --prod
- Set env vars: DATABASE_URL, SESSION_SECRET

## On Completion
When completely finished, run:
openclaw system event --text "BUILD COMPLETE: HarborPass — Marina Guest Check-In & Amenity Access" --mode now
