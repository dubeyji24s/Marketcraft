#!/usr/bin/env bash
# Marketcraft — start the app and give it a free public web address (Cloudflare quick tunnel).
# Run from the project folder:   bash scripts/start-public.sh
# Stop with Ctrl+C. The address changes every time you start it.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
PORT="${PORT:-4000}"
BIN="$ROOT/.tools"
mkdir -p "$BIN"

# Load nvm's Node if it was installed by setup-local.sh
if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh"
fi
command -v node >/dev/null || { echo "Node.js not found — run: bash scripts/setup-local.sh"; exit 1; }
[ -f server/.env ] && [ -d client/dist ] || { echo "Run setup first: bash scripts/setup-local.sh"; exit 1; }

# ---------- cloudflared (free, no account needed) ----------
CF="$(command -v cloudflared || true)"
if [ -z "$CF" ]; then
  CF="$BIN/cloudflared"
  if [ ! -x "$CF" ]; then
    echo "Downloading cloudflared (one time)…"
    os="$(uname -s)"; arch="$(uname -m)"
    case "$arch" in x86_64|amd64) a=amd64 ;; aarch64|arm64) a=arm64 ;; armv7l|armhf) a=arm ;; *) echo "Unsupported CPU: $arch"; exit 1 ;; esac
    base="https://github.com/cloudflare/cloudflared/releases/latest/download"
    if [ "$os" = Darwin ]; then
      curl -fsSL "$base/cloudflared-darwin-$a.tgz" | tar -xz -C "$BIN"
    else
      curl -fsSL -o "$CF" "$base/cloudflared-linux-$a"
    fi
    chmod +x "$CF"
  fi
fi

# ---------- start the server ----------
LOG="$ROOT/server/data-server.log"
echo "Starting Marketcraft on http://localhost:$PORT …"
(cd server && NODE_ENV=development PORT="$PORT" node src/index.js > "$LOG" 2>&1) &
SERVER_PID=$!
TUNNEL_PID=""
cleanup() {
  echo; echo "Stopping Marketcraft…"
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null || true
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 30); do
  curl -fsS "http://localhost:$PORT/api/health" >/dev/null 2>&1 && break
  kill -0 "$SERVER_PID" 2>/dev/null || { echo "Server failed to start:"; tail -n 30 "$LOG"; exit 1; }
  sleep 1
done

# ---------- start the tunnel ----------
TLOG="$ROOT/server/tunnel.log"
: > "$TLOG"
"$CF" tunnel --no-autoupdate --url "http://localhost:$PORT" > "$TLOG" 2>&1 &
TUNNEL_PID=$!

URL=""
for _ in $(seq 1 45); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TLOG" | grep -v '://api\.' | head -n1 || true)"
  [ -n "$URL" ] && break
  kill -0 "$TUNNEL_PID" 2>/dev/null || break
  grep -q 'failed to request quick Tunnel' "$TLOG" && break
  sleep 1
done

if [ -z "$URL" ]; then
  echo "Couldn't get a public link. Marketcraft still works on this computer at http://localhost:$PORT"
  tail -n 20 "$TLOG"
else
  cat <<EOF

  ╭──────────────────────────────────────────────────────────────╮
    🎉 Marketcraft is live!

    Public link (share this):  $URL
    On this computer:          http://localhost:$PORT

    • Keep this window open and the computer awake.
    • The link changes each time you start it.
    • Email/password sign-in works right away. For "Sign in with
      Google" add this address in Firebase → Authentication →
      Settings → Authorized domains:  ${URL#https://}
    • Press Ctrl+C to stop.
  ╰──────────────────────────────────────────────────────────────╯

EOF
fi
wait "$SERVER_PID"
