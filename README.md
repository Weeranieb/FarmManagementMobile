# FarmOS Mobile

React Native + Expo (TypeScript) client for the FarmOS Go backend. Ports the
Claude Design prototype in `../Farm OS/` into a real iOS / iPadOS / Android app.

- Runtime: Expo SDK 54, React Native 0.81, React 19
- Navigation: Expo Router (file-based, typed routes)
- Styling: NativeWind v4 + Tailwind tokens generated from `../Farm OS/tokens.js`
- Server state: TanStack Query
- Local state / auth: Zustand + `expo-secure-store`
- i18n: `i18next` + Thai default, `expo-localization`
- Fonts: IBM Plex Sans Thai / IBM Plex Sans via `@expo-google-fonts`
- Adaptive layouts: phone (bottom tabs) at <768 dp; tablet master–detail (76 px
  nav rail + 380 px master + flexible detail) at >=768 dp

## Getting started

```bash
cd mobile
nvm use 22       # Expo SDK 54 needs Node >= 20
npm install --legacy-peer-deps
cp .env.example .env
# Edit EXPO_PUBLIC_API_URL to point at your backend
# - iOS simulator / Android emulator: http://localhost:8080 (emulator → 10.0.2.2 at runtime)
# - Physical device: http://<your-mac-lan-ip>:8080

npm run prebuild          # first time (or after changing app.json native bits): generates ios/ + android/
npm run start
# press i for iOS simulator, a for Android, w for web
# Or: npm run ios / npm run android (builds native app via Xcode / Gradle, then runs Metro)
```

**Android Studio:** the Run button only installs/launches the native app — it does **not** start Metro. Either:

1. **Two terminals:** `npm run start` in `mobile/` (leave it running), then press Run in Android Studio, **or**
2. **One command from `mobile/`:** `npm run android` — Expo starts Metro and runs Gradle for you.

If the JS bundle fails to load, Metro was not running or the device could not reach port 8081 (USB: `adb reverse tcp:8081 tcp:8081`; Wi‑Fi: set `REACT_NATIVE_PACKAGER_HOSTNAME` in `.env` to your Mac’s LAN IP).

**Backend from Android:** use `EXPO_PUBLIC_API_URL=http://localhost:8080` for simulators/emulators (Android emulator is rewritten to `10.0.2.2` in code). For a **physical Android device**, set `EXPO_PUBLIC_API_URL` to `http://<your-mac-ip>:8080` — `localhost` on the phone is the phone itself, not your Mac.

## Native projects (Expo prebuild + CNG)

The `ios/` and `android/` folders are **generated**, not hand-maintained. They are listed in `.gitignore` so clones stay small; recreate them from config whenever needed:

```bash
npm run prebuild              # both platforms (--clean)
npm run prebuild:ios          # iOS only
npm run prebuild:android      # Android only
```

- **Do not edit** files inside `ios/` or `android/` directly — the next `npm run prebuild` will overwrite them.
- Put native changes in [app.json](app.json): `expo.ios`, `expo.android`, `ios.infoPlist`, `android.permissions`, and `expo.plugins`, then run `npm run prebuild` again.
- **Xcode:** after prebuild, open the workspace (not the bare project): `npm run ios:open` → `ios/FarmOS.xcworkspace`.
- **Android Studio:** `npm run android:open` → opens the `android/` folder.

For custom native code that app.json cannot express, add a small [config plugin](https://docs.expo.dev/config-plugins/introduction/) under `mobile/plugins/` and register it in `expo.plugins`.

### Running from Xcode (Debug)

In **Debug**, the iOS app loads JavaScript from **Metro** (see `AppDelegate.swift` → `RCTBundleURLProvider` / `.expo/.virtual-metro-entry`). If Metro is not running, the process can exit immediately and Xcode may show **“Simulator device failed to launch … No such process”**.

1. In a terminal: `cd mobile && npx expo start` (leave it running).
2. Then in Xcode: **Product → Run** (or press Run).

Alternatively run everything from the CLI (starts / reuses Metro and builds): `npm run ios`.

### Could not connect to development server (Metro)

The redbox URL uses **port 8081** and loads the **JavaScript bundle from Metro** on your Mac. That is separate from the Go API in `.env` (**8080**).

1. **Start Metro before Xcode** — In a terminal: `cd mobile && npx expo start` and leave it running, then **Product → Run** in Xcode. If Metro stops, the app cannot load `…8081/.expo/.virtual-metro-entry…`.
2. **Check Metro on the Mac** — From the same machine: `curl -sSf http://127.0.0.1:8081/status` should return JSON. If it fails, Metro is not listening or another process is using 8081.
3. **Physical iPhone** — `http://localhost:8081` on the device means **the phone itself**, not your Mac. Use one of:
   - Set **`REACT_NATIVE_PACKAGER_HOSTNAME`** to your Mac’s LAN IP (same Wi‑Fi) before starting Metro, e.g. `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.10 npx expo start` (see [`.env.example`](.env.example)), or
   - **Xcode** → Scheme → **Edit Scheme** → **Run** → **Arguments** → **Environment Variables** → add `REACT_NATIVE_PACKAGER_HOSTNAME` = your Mac IP, or
   - Run `npx expo start --tunnel` (works across networks; slower), or
   - Shake the device → **Dev Menu** → **Configure Bundler** (wording varies) and enter `http://<Mac-IP>:8081`.
4. **Firewall / VPN** — macOS firewall may block inbound 8081; allow **Node** (or temporarily disable the firewall to test). Corporate VPNs sometimes block device ↔ Mac LAN traffic.

`AppDelegate.swift` uses `RCTBundleURLProvider` in Debug; you normally **do not** hardcode the URL there — fix connectivity with the steps above.

### If the simulator still fails to launch

- **Product → Clean Build Folder**, then build again.
- **Delete the app** from the simulator (or run `xcrun simctl uninstall booted com.farmos.mobile`), then run again.
- **Restart the simulator** (or `xcrun simctl shutdown all` and pick the device again).
- On **very new iOS / Xcode betas** (e.g. iOS 26), try an older simulator runtime if issues persist — toolchain bugs sometimes surface as “No such process”.

## Scripts

| Command                    | Description                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `npm run start`            | Start the Expo dev server                                                               |
| `npm run ios`              | Build and run the iOS app (`expo run:ios`; requires `ios/` from prebuild)               |
| `npm run android`          | Build and run the Android app (`expo run:android`; requires `android/` from prebuild)   |
| `npm run prebuild`         | Regenerate `ios/` + `android/` from `app.json` (CNG, `--clean`)                         |
| `npm run prebuild:ios`     | Regenerate `ios/` only                                                                  |
| `npm run prebuild:android` | Regenerate `android/` only                                                              |
| `npm run ios:open`         | Open `ios/FarmOS.xcworkspace` in Xcode                                                  |
| `npm run android:open`     | Open `android/` in Android Studio                                                       |
| `npm run tokens:gen`       | Re-generate `src/theme/tokens.ts` and `tokens.tailwind.cjs` from `../Farm OS/tokens.js` |
| `npm run lint`             | `expo lint`                                                                             |
| `npm run format`           | Prettier across `app/` and `src/`                                                       |

## Layout

```text
mobile/
├── app/                       # Expo Router routes
│   ├── _layout.tsx            # Providers (theme, query, auth, fonts) + auth gate
│   ├── index.tsx              # Splash redirect by auth state
│   ├── (auth)/login.tsx
│   └── (app)/                 # Authenticated stack
│       ├── _layout.tsx        # Adaptive: bottom tabs (phone) | master–detail (tablet)
│       ├── (tabs)/{home,farms,profile}.tsx
│       ├── pond/[id]/{index,daily-log}.tsx
│       └── flows/{fill,move,sell}.tsx
├── src/
│   ├── api/                   # Typed REST client + react-query hooks
│   ├── components/{ui,domain,layout,icons}
│   ├── data/                  # API-with-mock-fallback layer
│   ├── hooks/                 # useIsTablet, useBreakpoint
│   ├── locale/                # i18n + Thai date helpers
│   ├── mock/                  # Ported Farm OS/mock-data.js
│   ├── screens/               # Screen components (phone & tablet share these)
│   ├── store/auth.ts          # zustand auth store
│   ├── theme/                 # tokens + ThemeProvider + useAppFonts
│   └── utils/fmt.ts
├── scripts/oklch-to-hex.ts    # Token codegen
├── tailwind.config.js         # Reads tokens.tailwind.cjs
├── babel.config.js            # NativeWind preset + Expo
├── metro.config.js            # NativeWind transform
└── app.json                   # iOS bundle, Android pkg, iPad multitasking, orientations
```

## Theming (3 modes)

The design uses three palettes (light / dark / outdoor for high-contrast
sunlight). Source-of-truth tokens live in [`../Farm OS/tokens.js`](../Farm%20OS/tokens.js)
as `oklch(L C H)` — unsupported on native, so `npm run tokens:gen` converts them
to sRGB hex via `culori`. Re-run that script whenever the design tokens change.

The active mode is held in `useTheme()` and persisted in SecureStore. Tailwind
colors are pinned to the `light` palette; runtime mode swaps go through inline
style + `t.*` lookups.

## Adaptive (phone vs iPad)

`useIsTablet()` (≥768 dp) toggles the chrome:

- phone → `<Tabs>` bottom bar (`app/(app)/(tabs)/_layout.tsx`)
- tablet → `TabletLayout` with rail + master + detail

Screens (`HomeScreen`, `FarmsScreen`, `PondDetailScreen`, `DailyLogScreen`,
flows) are pure components used in both layouts; only the chrome differs.

## Mock vs live data

`src/data/index.ts` exposes `useFarmsData`, `usePondsData`, `usePondData`,
`useDailyLogData`. Each transparently falls back to mock data (from
`../Farm OS/mock-data.js`) whenever the user is not signed in or the API errors,
so screens stay rendered while developing. Once `EXPO_PUBLIC_API_URL` and a JWT
are present, live API responses take over automatically.

Flows (Fill / Move / Sell) call the matching mutation when authed and just
close the modal otherwise — no offline queueing in v1.

## App icons + splash

The repo ships Expo defaults. To match the design's "บ" brand mark, replace:

- `assets/icon.png` (1024×1024)
- `assets/adaptive-icon.png` (Android, 1024×1024)
- `assets/splash-icon.png` (centered, ~200 px content area)
- `assets/favicon.png` (web)

Splash background is set in `app.json` to the design's warm off-white
(`#fafaf7`). Adjust `expo-splash-screen` config there if you swap palettes.

## Out of scope (v1)

- EAS submit pipelines / store metadata
- Push notifications, background sync, offline writes
- Detox / Maestro automated tests
- Backend changes — mobile consumes existing endpoints as-is

## Troubleshooting

- **Android Studio / Gradle: `Cannot run program "node"`** — The IDE does not load nvm’s `PATH`. This project sets `node.executable` in `android/local.properties`, patches `settings.gradle` / `app/build.gradle`, and prepends `android/gradlew` so `PATH` and `NODE_BINARY` include that Node (needed for **Expo’s Kotlin autolinking**, which still invokes bare `node`). After changing this, run **`cd mobile/android && ./gradlew --stop`** then sync again so Gradle picks up the env. If it still fails, in Android Studio use **Gradle → Gradle wrapper** (not a standalone Gradle install), or add your nvm `bin` directory to **Gradle environment / PATH** in the IDE.
- **Metro can't find `tokens.tailwind.cjs`** — run `npm run tokens:gen`
- **Fonts look fallback-y** — first launch downloads them; check
  `useAppFonts()` returns `loaded: true`
- **401 loop** — JWT expired; the API client clears the auth store on 401, the
  root layout redirects you to `(auth)/login`
- **Android emulator can't reach backend** — use `http://10.0.2.2:8080`, not
  `localhost`
