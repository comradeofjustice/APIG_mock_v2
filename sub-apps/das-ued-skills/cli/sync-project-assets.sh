#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./cli/sync-project-assets.sh --project-root PATH [--force] [--move] [--dry-run]

Options:
  --project-root   Target project root directory (where project assets should live)
  --force          Overwrite existing files in target
  --move           Move files instead of copy (DANGEROUS: will remove from this repo)
  --dry-run        Print operations only
  -h|--help        Show help

This script copies everything under ./project/ to the target project root.
EOF
}

PROJECT_ROOT=""
FORCE=0
MOVE=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-root)
      [[ $# -ge 2 ]] || { echo "Missing value for --project-root" >&2; exit 1; }
      PROJECT_ROOT="$2"
      shift 2
      ;;
    --force)
      FORCE=1
      shift 1
      ;;
    --move)
      MOVE=1
      shift 1
      ;;
    --dry-run)
      DRY_RUN=1
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_ROOT" ]]; then
  echo "Error: --project-root is required" >&2
  usage
  exit 1
fi

if [[ ! -d "$PROJECT_ROOT" ]]; then
  echo "Error: project root not found: $PROJECT_ROOT" >&2
  exit 1
fi

SRC_DIR="$REPO_ROOT/project"
if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: missing repo project assets dir: $SRC_DIR" >&2
  exit 1
fi

shopt -s nullglob
FILES=( "$SRC_DIR"/* )
shopt -u nullglob

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No files found in $SRC_DIR (nothing to sync)."
  exit 0
fi

copied=0
skipped=0

for src in "${FILES[@]}"; do
  base="$(basename "$src")"
  dest="$PROJECT_ROOT/$base"

  if [[ -e "$dest" && $FORCE -eq 0 ]]; then
    echo "SKIP (exists): $base"
    skipped=$((skipped+1))
    continue
  fi

  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRYRUN: $( [[ $MOVE -eq 1 ]] && echo mv || echo cp ) \"$src\" \"$dest\""
    if [[ $MOVE -eq 0 ]]; then
      copied=$((copied+1))
    else
      copied=$((copied+1))
    fi
    continue
  fi

  mkdir -p "$PROJECT_ROOT"
  if [[ $MOVE -eq 1 ]]; then
    mv -f "$src" "$dest"
  else
    cp -f "$src" "$dest"
  fi
  echo "OK: $base"
  copied=$((copied+1))
done

echo "Done. synced=$copied skipped=$skipped (force=$FORCE move=$MOVE)"

