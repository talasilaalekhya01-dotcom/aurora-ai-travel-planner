#!/bin/sh
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
node scripts/fetch-hero.mjs
npm run build
node server.mjs --open
