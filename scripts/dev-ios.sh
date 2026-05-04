#!/usr/bin/env bash
# Launches Metro in a new Terminal window, then builds + installs the iOS app
# in the current terminal so the two run side by side.
#
# Usage: npm run ios:split
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# NOTE: single-quote the path so AppleScript's "do script" can wrap the whole thing
# in double quotes without nested-quote confusion.
METRO_CMD="cd '$PROJECT_DIR' && npx expo start --dev-client -c"

# 1) Open a new Terminal window running Metro.
osascript <<EOF
tell application "Terminal"
    activate
    do script "$METRO_CMD"
    set custom title of front window to "Metro — FarmOS"
end tell
EOF

# Give Metro a moment to bind 8081 before run:ios tries to connect.
echo "Waiting for Metro on :8081..."
for i in $(seq 1 60); do
  if lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Metro is up."
    break
  fi
  sleep 1
done

# 2) Build & install the iOS app in THIS terminal, but skip starting another Metro
#    AND skip the noisy os_log attach.
cd "$PROJECT_DIR"
exec npx expo run:ios --no-bundler --no-install
