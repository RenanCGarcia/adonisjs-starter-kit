#!/usr/bin/env sh
# Clones (or updates) the AdonisJS v7 docs into repos/adonisjs-docs as read-only
# reference for coding agents. Gitignored: only the docs content/ is checked out.
set -eu

DEST="$(git rev-parse --show-toplevel)/repos/adonisjs-docs"
REPO="https://github.com/adonisjs/v7-docs.git"

if [ -d "$DEST/.git" ]; then
  git -C "$DEST" pull --quiet --ff-only
else
  git clone --quiet --depth 1 --filter=blob:none --sparse "$REPO" "$DEST"
fi

# Non-cone mode: cone mode would also check out the docs site's root files (ace.js, package.json...).
git -C "$DEST" sparse-checkout set --no-cone /content/start/ /content/guides/ /content/reference/

echo "AdonisJS docs at $(git -C "$DEST" log -1 --format='%h (%cs)') -> $DEST/content"
