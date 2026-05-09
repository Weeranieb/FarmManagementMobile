# Definition of Done — Farm OS Mobile

Before marking any Linear issue as **Done**, all applicable items must be checked.

This is the discipline a BA / SA / QA would normally enforce. As a solo dev, this is your guardrail against shipping half-done work.

---

## Code

- [ ] Branch follows naming: `niebfeelgood/far-<n>-<slug>` (Linear auto-generates this)
- [ ] PR title contains `FAR-<n>` (so Linear auto-links and updates status)
- [ ] PR description has 2-line summary + link to Linear issue
- [ ] No `console.log` / commented-out debug code
- [ ] TypeScript types correct
- [ ] No new ESLint warnings

## Functional testing — REAL DEVICE

- [ ] Tested on at least one real Android device (NOT just simulator)
- [ ] Tested on at least one real iOS device (or simulator if iOS deferred to R2)
- [ ] All acceptance criteria from the Linear issue are verified
- [ ] Empty state, error state, loading state — handled and tested
- [ ] Network failure handled (airplane mode test): clear error message, no crash
- [ ] Tested with both owner role and staff role (if applicable)

## UX

- [ ] Touch targets ≥ 44pt
- [ ] Forms work with on-screen keyboard (no fields hidden behind keyboard)
- [ ] Submit button disabled while request in flight (no double-submit)
- [ ] Success/error feedback visible (toast, inline message, or screen change)

## Data & state

- [ ] No hardcoded URLs (use env config)
- [ ] Token stored in SecureStore / EncryptedStorage (not AsyncStorage for sensitive data)
- [ ] No PII written to logs
- [ ] App relaunch test: state restored as expected (or clearly logged out)

## Cross-platform compatibility

- [ ] Backend dependency met: required API endpoint is on dev
- [ ] Web team aware of any UX patterns being mirrored

## Docs

- [ ] `CHANGELOG.md` updated under `[Unreleased]` with `(FAR-<n>)` tag
- [ ] README updated if env var / native dependency added
- [ ] All acceptance criteria checkboxes ticked in the Linear issue description

---

## Definition of Released

Once a release ships:

- [ ] Issue moved to milestone "6. Released"
- [ ] Version bump in `app.json` / `package.json`
- [ ] Build number incremented (required for App Store / Play Store / TestFlight)
- [ ] CHANGELOG `[Unreleased]` rolled into a new version section with date
- [ ] Linear issue status set to **Done**

---

## Skipping items

If a check doesn't apply, write `N/A` next to it in the PR description with a one-line reason. Don't silently skip.
