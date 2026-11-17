#!/usr/bin/env bash
# Marketcraft — one-time setup on your own computer (Chromebook Linux, Linux or macOS).
# Run from the project folder:   bash scripts/setup-local.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
ok()   { printf '  \033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[1;33m!\033[0m %s\n' "$*"; }

# ---------- 1. Node.js 22 ----------
say "Checking Node.js (needs version 22 or newer)"
need_node=1
if command -v node >/dev/null 2>&1; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$major" -ge 22 ] && need_node=0
fi
if [ "$need_node" = 1 ]; then
  warn "Installing Node.js 22 with nvm (takes a minute)…"
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm alias default 22
fi
ok "Node $(node -v)"

# ---------- 2. Packages ----------
say "Installing packages (first time takes a few minutes)"
npm --prefix server install --no-audit --no-fund
npm --prefix client install --no-audit --no-fund
ok "Packages installed"

# ---------- 3. Settings files ----------
ask() { # ask "Question" default -> echoes answer
  local q="$1" def="${2:-}" a
  if [ -n "$def" ]; then read -r -p "  $q [$def]: " a; else read -r -p "  $q: " a; fi
  echo "${a:-$def}"
}

if [ ! -f client/.env ]; then
  say "Firebase settings (Firebase console → Project settings → Your apps → Web app config)"
  echo "  These are the public web-app values, the same ones you pasted before."
  FB_KEY="$(ask 'apiKey')"
  FB_PROJECT="$(ask 'projectId')"
  FB_APP="$(ask 'appId (looks like 1:1234:web:abcd)')"
  FB_SENDER="$(echo "$FB_APP" | cut -d: -f2)"
  cat > client/.env <<EOF
VITE_FIREBASE_API_KEY=$FB_KEY
VITE_FIREBASE_AUTH_DOMAIN=$FB_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=$FB_PROJECT
VITE_FIREBASE_APP_ID=$FB_APP
VITE_FIREBASE_STORAGE_BUCKET=$FB_PROJECT.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=$FB_SENDER
EOF
  ok "Wrote client/.env"
else
  ok "client/.env already exists — keeping it"
fi

if [ ! -f server/.env ]; then
  say "Server settings"
  PROJECT="$(grep '^VITE_FIREBASE_PROJECT_ID=' client/.env | cut -d= -f2)"
  ADMIN="$(ask 'Your admin email (the one you sign in with)')"
  SECRET="$(node -e 'console.log(require("crypto").randomBytes(48).toString("hex"))')"
  cat > server/.env <<EOF
PORT=4000
JWT_SECRET=$SECRET
FIREBASE_PROJECT_ID=$PROJECT
ADMIN_EMAILS=$ADMIN
PASS_THRESHOLD=85
DISTINCTION_THRESHOLD=95
# Optional: the partner company's real name (never shown on Marketcraft pages)
COMPANY_NAME=
# Optional: paid Claude API key. Leave empty — the free Starter engine is used.
ANTHROPIC_API_KEY=
# Optional: Canva Connect (see README)
CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=
CANVA_REDIRECT_URI=
EOF
  ok "Wrote server/.env"
else
  ok "server/.env already exists — keeping it"
fi

# ---------- 4. Build the website ----------
say "Building the website"
npm --prefix client run build
ok "Built client/dist"

say "All set! To start Marketcraft with a public link, run:"
echo "    bash scripts/start-public.sh"
