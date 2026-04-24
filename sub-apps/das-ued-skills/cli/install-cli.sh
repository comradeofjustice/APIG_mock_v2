#!/usr/bin/env bash
set -euo pipefail

# Installs das-ued-skills CLI into ~/.local/bin

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="${HOME}/.local/bin"
SRC="${REPO_ROOT}/cli/das-ued-skills"
DST="${BIN_DIR}/das-ued-skills"

mkdir -p "$BIN_DIR"
cp "$SRC" "$DST"
chmod +x "$DST"

echo "Installed: $DST"
echo
echo "If command not found, add this to your shell config (~/.zshrc):"
echo '  export PATH="$HOME/.local/bin:$PATH"'
