#!/usr/bin/env bash
set -euo pipefail

# One-command installer for Cursor users.
# Usage:
#   ./cli/quick-install-cursor.sh

CLI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing skills to Cursor..."
"$CLI_DIR/install-skills.sh" --ai cursor

echo
echo "Done. Installed to: $HOME/.cursor/skills"
echo "Next: restart Cursor (or reload window) and start using skills."
