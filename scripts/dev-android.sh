#!/usr/bin/env bash
# Launches Metro in a new Terminal window, then builds + installs the Android app
# in the current terminal so the two run side by side.
#
# Usage: npm run android:split
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# NOTE: single-quote the path so AppleScript's "do script" can wrap the whole thing
# in double quotes without nested-quote confusion.
METRO_CMD="cd '$PROJECT_DIR' && npx expo start --dev-client -c"

osascript <<EOF
tell application "Terminal"
    activate
    do script "$METRO_CMD"
    set custom title of front window to "Metro — FarmOS"
end tell
EOF

echo "Waiting for Metro on :8081..."
for i in $(seq 1 60); do
  if lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Metro is up."
    break
  fi
  sleep 1
done

cd "$PROJECT_DIR"
exec npx expo run:android --no-bundler
