#!/usr/bin/env bash
# Invoked from the FarmOS Xcode scheme as a Build pre-action.
# Strategy:
#   1. If port 8081 is already listening -> nothing to do, return immediately.
#   2. Otherwise, write a one-shot .command file that runs Metro, then `open`
#      it. macOS opens .command files in a fresh Terminal window. This avoids
#      the AppleEvents/Automation permission tax that osascript triggers.
#   3. Poll port 8081 until Metro binds it, with a hard timeout. The pre-action
#      blocks Xcode's build during this wait so the app doesn't launch before
#      the bundler is ready. Subsequent builds skip step 2/3 because Metro
#      stays running.
#
# Always exits 0. We do NOT want a Metro launch hiccup to fail the Xcode build.

set -u

LOG=/tmp/xcode-start-metro.log
exec >>"$LOG" 2>&1

echo "---- $(date '+%Y-%m-%d %H:%M:%S') ----"
echo "SRCROOT=${SRCROOT:-<unset>}"

# Resolve the project root regardless of how we're invoked.
if [[ -n "${SRCROOT:-}" ]]; then
  PROJECT_DIR="${SRCROOT%/ios}"
else
  PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi
echo "PROJECT_DIR=$PROJECT_DIR"

# Step 1 — already up?
if /usr/sbin/lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 8081 already listening — skipping launch"
  exit 0
fi

# Step 2 — write a .command launcher and open it in Terminal.app.
# We try Homebrew bin first because Xcode's PATH usually drops nvm/Homebrew.
CMD_FILE="$(/usr/bin/mktemp -t farmos-metro-XXXXXX).command"
cat >"$CMD_FILE" <<COMMAND
#!/usr/bin/env bash
# Launches Metro for FarmOS. Path to project is baked at write time.
export PATH="/opt/homebrew/bin:/usr/local/bin:\$PATH"
cd '$PROJECT_DIR' || exit 1
clear
echo "Starting Metro for FarmOS..."
exec npx expo start --dev-client -c
COMMAND
chmod +x "$CMD_FILE"
echo "Wrote launcher: $CMD_FILE"

if ! /usr/bin/open -a Terminal "$CMD_FILE"; then
  echo "open -a Terminal failed (status $?)"
  exit 0
fi
echo "Opened Terminal with $CMD_FILE"

# Step 3 — wait up to 45s for Metro to bind 8081. Don't block forever; if it
# never comes up we still let the build proceed (user will see the red box and
# can investigate via this log).
DEADLINE=$(( $(date +%s) + 45 ))
while [[ $(date +%s) -lt $DEADLINE ]]; do
  if /usr/sbin/lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Metro is up at $(date '+%H:%M:%S')"
    exit 0
  fi
  sleep 0.5
done

echo "Timed out waiting for Metro on 8081 — letting build continue anyway"
exit 0
