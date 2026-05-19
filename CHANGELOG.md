# Changelog — Farm OS Mobile

All notable changes to the Farm OS React Native app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Linear issue references use the `FAR-N` format and link to https://linear.app/farm-os.

---

## [0.2.2](https://github.com/Weeranieb/FarmManagementMobile/compare/v0.2.1...v0.2.2) (2026-05-17)


### Features

* far 17 enhance pond detail ([#13](https://github.com/Weeranieb/FarmManagementMobile/issues/13)) ([e2f1827](https://github.com/Weeranieb/FarmManagementMobile/commit/e2f1827185614a3e46c496c4b00e67150bbe18e8))
* **feed-collection:** mobile parity — list, detail, history, admin ([#15](https://github.com/Weeranieb/FarmManagementMobile/issues/15)) ([b462f93](https://github.com/Weeranieb/FarmManagementMobile/commit/b462f93348b1347c626b6ae2ffef88769d66ec5c))

## [0.2.1](https://github.com/Weeranieb/FarmManagementMobile/compare/v0.2.0...v0.2.1) (2026-05-13)


### Bug Fixes

* login screen ([#10](https://github.com/Weeranieb/FarmManagementMobile/issues/10)) ([bcdd10c](https://github.com/Weeranieb/FarmManagementMobile/commit/bcdd10cb44c5933e90b9f96eb9c2ea58ae67ca0e))
* version number ([#8](https://github.com/Weeranieb/FarmManagementMobile/issues/8)) ([dd98720](https://github.com/Weeranieb/FarmManagementMobile/commit/dd98720ca68d6a7c30b43bc100240092067222ed))

## [0.2.0](https://github.com/Weeranieb/FarmManagementMobile/compare/v0.1.0...v0.2.0) (2026-05-09)


### Features

* **account-info:** wire change password to PUT /user/password ([5554d63](https://github.com/Weeranieb/FarmManagementMobile/commit/5554d6359ab7cf08a83582952f25d8570dc965e9))
* **farm-ponds:** localize pond and farm titles in UI ([adc1ac4](https://github.com/Weeranieb/FarmManagementMobile/commit/adc1ac442631eb8b1f35ad45d67689324ef453f2))
* **farms:** move search UI from inline bar to header trailing icon ([11f8968](https://github.com/Weeranieb/FarmManagementMobile/commit/11f8968b91efbe0ddb7aecdfc3699d2f4642d93c))
* **i18n:** add English translations and restore saved language ([d798518](https://github.com/Weeranieb/FarmManagementMobile/commit/d79851896d200348fa6f812fc6e17d6a3f0f4f5a))
* **profile:** add account-info screen, change-password sheet, language picker ([2ee3fa2](https://github.com/Weeranieb/FarmManagementMobile/commit/2ee3fa2333fe742880caefec2ae43135e1b4ec87))


### Bug Fixes

* **account-info:** refresh user from backend on mount, wire real save ([27204ca](https://github.com/Weeranieb/FarmManagementMobile/commit/27204ca0646ffc426e35f5b6e5802630d20cfec0))
* **account-info:** sheet entrance animation and overflowing buttons ([00d8021](https://github.com/Weeranieb/FarmManagementMobile/commit/00d8021357054e80fb1641613b00cfab301262cf))
* **farm-ponds:** back button should return to farms tab, not home ([3249f39](https://github.com/Weeranieb/FarmManagementMobile/commit/3249f3992dfa21709e01d5934049e0a1d7c53c3d))
* **profile:** move account-info route to src/app — actual app root ([dad834c](https://github.com/Weeranieb/FarmManagementMobile/commit/dad834c2cd0d8d30915fbd2ff34bcc1328df550e))

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
