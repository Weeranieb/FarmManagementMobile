#!/usr/bin/env bash
# Build a release APK for a given environment.
#
# Usage: scripts/build-android.sh <dev|uat|prod> [light]
#
# Reads EXPO_PUBLIC_* vars from .env.<resolved> (development|uat|production)
# and bakes them into the release JS bundle. Writes the APK to:
#   dist/farm_os_<version>_<env>.apk
#   dist/farm_os_<version>_<env>_light.apk   (when `light` is passed)
#
# light = arm64-v8a only + R8 minify + resource shrink + JS bundle compression
#         (~27 MB vs ~80 MB universal). Fine for real phones ~2018+.
#
# The repo's `.env` (used by `npm run start` / `npm run android`) is NOT touched.

set -euo pipefail

ENV_ARG="${1:-}"
MODE_ARG="${2:-}"
case "$ENV_ARG" in
  dev)  ENV_FILE=".env.development" ;;
  uat)  ENV_FILE=".env.uat" ;;
  prod) ENV_FILE=".env.production" ;;
  *)
    echo "Usage: $0 <dev|uat|prod> [light]" >&2
    exit 1
    ;;
esac

LIGHT=false
case "$MODE_ARG" in
  "" ) ;;
  light) LIGHT=true ;;
  *)
    echo "Usage: $0 <dev|uat|prod> [light]" >&2
    exit 1
    ;;
esac

# Resolve the mobile project root (the parent of scripts/).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE not found in $ROOT" >&2
  exit 1
fi

# Load env vars from the file into the current shell so they reach gradle.
# `set -a` exports every variable assigned until `set +a`.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${EXPO_PUBLIC_API_URL:-}" ]]; then
  echo "error: EXPO_PUBLIC_API_URL not set after sourcing $ENV_FILE" >&2
  exit 1
fi

# Prefer Android Studio's JBR when JAVA_HOME isn't set (common on macOS).
if [[ -z "${JAVA_HOME:-}" && -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

VERSION="$(node -p "require('./app.json').expo.version")"
DIST_DIR="$ROOT/dist"
mkdir -p "$DIST_DIR"

SUFFIX="$ENV_ARG"
GRADLE_ARGS=()
if [[ "$LIGHT" == true ]]; then
  SUFFIX="${ENV_ARG}_light"
  GRADLE_ARGS+=(
    -PreactNativeArchitectures=arm64-v8a
    -Pandroid.enableMinifyInReleaseBuilds=true
    -Pandroid.enableShrinkResourcesInReleaseBuilds=true
    -Pandroid.enableBundleCompression=true
  )
fi

echo "==> Building FarmOS Android release"
echo "    env:     $ENV_ARG ($ENV_FILE)"
echo "    mode:    $([[ "$LIGHT" == true ]] && echo light || echo universal)"
echo "    api url: $EXPO_PUBLIC_API_URL"
echo "    version: $VERSION"

# Force the JS bundle to regenerate so the env URL gets baked in.
# Without this, gradle's incremental build skips the bundle task when only
# .env.* files (which gradle does not track) have changed.
rm -rf \
  android/app/build/generated/assets/createBundleReleaseJsAndAssets \
  android/app/build/intermediates/assets

(cd android && ./gradlew assembleRelease "${GRADLE_ARGS[@]+"${GRADLE_ARGS[@]}"}")

SRC="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
DEST="$DIST_DIR/farm_os_${VERSION}_${SUFFIX}.apk"

if [[ ! -f "$SRC" ]]; then
  echo "error: expected APK not found at $SRC" >&2
  exit 1
fi

cp "$SRC" "$DEST"
SIZE="$(du -h "$DEST" | cut -f1)"
echo "==> Done. APK: $DEST ($SIZE)"
