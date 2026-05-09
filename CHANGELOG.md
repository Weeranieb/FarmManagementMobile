# Changelog — Farm OS Mobile

All notable changes to the Farm OS React Native app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Linear issue references use the `FAR-N` format and link to https://linear.app/farm-os.

---

## [Unreleased]

### Added
- _work in progress_

### Changed
- _none_

### Fixed
- _none_

### Removed
- _none_

---

## [0.1.0] — 2026-06-08 (Demo Release · build 1)

First public-ish mobile release for staff field use. Optimized for fast logging on phone.

### Added
- Login + Signup screens (FAR-9)
- Persist token across app restart with auto-login / auto-logout (FAR-10)
- Farm list + create form (FAR-17)
- Pond detail screen with quick actions (log feed / stock / transfer) (FAR-18)
- Quick log feed entry — under 30s flow (FAR-23)
- Feed log history per pond with pull-to-refresh (FAR-24)
- Stock fish into pond (FAR-29)
- Transfer fish between ponds (FAR-30)
- Quick record buy or sell with tab toggle (FAR-35)

### Notes
- Backend dependency: API v0.1.0
- Built against React Native + Expo (TBD versions)
- Build number: 1
- Distributed via Expo dev client / TestFlight (not App Store / Play Store yet)

---

## How to update this file

1. While working on a Linear issue, append your change under `[Unreleased]`.
2. Each entry: `- Short description (FAR-N)`.
3. On release day, move entries under a new version heading. Increment build number for native binaries.
4. Bump `app.json` / `package.json` version to match.

## Mobile-specific bump rules

- **Major (X.0.0)** — breaking change requires user logout/reinstall, or breaks compatibility with API < X.0.0
- **Minor (0.X.0)** — new feature, new screen, no force-update needed
- **Patch (0.0.X)** — bug fix, copy update, style tweak
- **Build number** — always increment by 1 for any binary release (App Store / Play Store / TestFlight require unique build numbers)
