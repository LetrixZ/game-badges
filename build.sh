#!/usr/bin/env bash
set -euo pipefail

# Always work from the repository root, regardless of where this script is run.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

# Keep the on-device folder and plugin identity unchanged.
PLUGIN_DIR_NAME="Game Badges"
DECK_SSH_TARGET="${DECK_SSH_TARGET:-deck}"
DECK_REMOTE_DIR="${DECK_REMOTE_DIR:-/home/deck/}"

VERSION="$(node -p "require('./package.json').version")"
ZIP_NAME="Game_Badges_dev_v${VERSION}.zip"
BUILD_DIR="$REPO_ROOT/.build"

echo "Building Game Badges v${VERSION}"

# 1. Build the frontend bundle.
pnpm run build

# 2. Assemble a fresh package so stale files cannot remain in the archive.
mkdir -p "$BUILD_DIR"
STAGE_DIR="$(mktemp -d "$BUILD_DIR/stage.XXXXXX")"
trap 'rm -rf "$STAGE_DIR"' EXIT
PLUGIN_STAGE_DIR="$STAGE_DIR/$PLUGIN_DIR_NAME"
mkdir -p "$PLUGIN_STAGE_DIR"

INCLUDE_FILES=(plugin.json package.json main.py README.md LICENSE)
for file in "${INCLUDE_FILES[@]}"; do
  cp "$file" "$PLUGIN_STAGE_DIR/$file"
done
cp -R dist "$PLUGIN_STAGE_DIR/dist"

# 3. Replace the archive rather than updating it, which could retain stale files.
rm -f "$ZIP_NAME"
( cd "$STAGE_DIR" && zip -r -q "$REPO_ROOT/$ZIP_NAME" "$PLUGIN_DIR_NAME" )

# 4. Copy the archive to the Deck (override either destination with env vars).
scp "$ZIP_NAME" "$DECK_SSH_TARGET:$DECK_REMOTE_DIR"

echo "Done: $ZIP_NAME"
