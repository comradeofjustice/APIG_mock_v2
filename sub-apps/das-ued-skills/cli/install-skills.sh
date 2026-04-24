#!/usr/bin/env bash
set -euo pipefail

# One-command installer for local skills in this repo.
# Default installs to Cursor skills directory.

AI_TARGET="cursor"
TARGET_DIR=""
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./cli/install-skills.sh [--ai claude|cursor|windsurf|antigravity|copilot|kiro|codex|qoder|roocode|gemini|trae|opencode|continue|codebuddy|droid|all] [--target-dir PATH]

Options:
  --ai          Install target assistant, default: cursor
  --target-dir  Override install directory (advanced)
  -h, --help    Show help

Examples:
  ./cli/install-skills.sh --ai claude
  ./cli/install-skills.sh --ai cursor
  ./cli/install-skills.sh --ai windsurf
  ./cli/install-skills.sh --ai codex
  ./cli/install-skills.sh --ai all
EOF
}

resolve_target_dir() {
  local ai="$1"
  if [[ -n "$TARGET_DIR" ]]; then
    printf '%s\n' "$TARGET_DIR"
    return 0
  fi

  case "$ai" in
    claude)      printf '%s\n' "$HOME/.claude/skills" ;;
    cursor)      printf '%s\n' "$HOME/.cursor/skills" ;;
    windsurf)    printf '%s\n' "$HOME/.windsurf/skills" ;;
    antigravity) printf '%s\n' "$HOME/.antigravity/skills" ;;
    copilot)     printf '%s\n' "$HOME/.copilot/skills" ;;
    kiro)        printf '%s\n' "$HOME/.kiro/skills" ;;
    codex)       printf '%s\n' "$HOME/.codex/skills" ;;
    qoder)       printf '%s\n' "$HOME/.qoder/skills" ;;
    roocode)     printf '%s\n' "$HOME/.roocode/skills" ;;
    gemini)      printf '%s\n' "$HOME/.gemini/skills" ;;
    trae)        printf '%s\n' "$HOME/.trae/skills" ;;
    opencode)    printf '%s\n' "$HOME/.opencode/skills" ;;
    continue)    printf '%s\n' "$HOME/.continue/skills" ;;
    codebuddy)   printf '%s\n' "$HOME/.codebuddy/skills" ;;
    droid)       printf '%s\n' "$HOME/.factory/skills" ;;
    *)
      echo "Unsupported --ai: $ai" >&2
      exit 1
      ;;
  esac
}

collect_skill_dirs() {
  local base="$1"
  if command -v rg >/dev/null 2>&1; then
    rg --files -g '**/SKILL.md' "$base" | while IFS= read -r skill_file; do
      dirname "$skill_file"
    done
  else
    find "$base" -name SKILL.md -type f | while IFS= read -r skill_file; do
      dirname "$skill_file"
    done
  fi
}

skill_install_name() {
  local repo_root="$1"
  local skill_dir="$2"
  local relative
  relative="${skill_dir#${repo_root}/}"
  printf '%s
' "${relative//\//-}"
}

sync_global_rules_to_one() {
  local ai="$1"
  local rules_target=""
  case "$ai" in
    cursor) rules_target="$HOME/.cursor/rules" ;;
    claude) rules_target="$HOME/.claude/rules" ;;
    windsurf) rules_target="$HOME/.windsurf/rules" ;;
    antigravity) rules_target="$HOME/.antigravity/rules" ;;
    copilot) rules_target="$HOME/.copilot/rules" ;;
    kiro) rules_target="$HOME/.kiro/rules" ;;
    codex) rules_target="$HOME/.codex/rules" ;;
    qoder) rules_target="$HOME/.qoder/rules" ;;
    roocode) rules_target="$HOME/.roocode/rules" ;;
    gemini) rules_target="$HOME/.gemini/rules" ;;
    trae) rules_target="$HOME/.trae/rules" ;;
    opencode) rules_target="$HOME/.opencode/rules" ;;
    continue) rules_target="$HOME/.continue/rules" ;;
    codebuddy) rules_target="$HOME/.codebuddy/rules" ;;
    droid) rules_target="$HOME/.factory/rules" ;;
    *) return 0 ;;
  esac

  mkdir -p "$rules_target"
  # Only copy mdc rules from this repo root.
  shopt -s nullglob
  cp -f "$REPO_ROOT/rules/"*.mdc "$rules_target/" 2>/dev/null || true
  shopt -u nullglob

  echo "  - synced rules: $(ls -1 "$rules_target" 2>/dev/null | wc -l) files"
}

install_to_one() {
  local ai="$1"
  local target
  target="$(resolve_target_dir "$ai")"
  mkdir -p "$target"

  echo "Installing skills to: $target"
  local skill_dir name
  while IFS= read -r skill_dir; do
    name="$(skill_install_name "$REPO_ROOT" "$skill_dir")"
    rm -rf "$target/$name"
    cp -R "$skill_dir" "$target/$name"
    echo "  - installed: $name"
  done < <(collect_skill_dirs "$REPO_ROOT")
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ai)
      [[ $# -ge 2 ]] || { echo "Missing value for --ai" >&2; exit 1; }
      AI_TARGET="$2"
      shift 2
      ;;
    --target-dir)
      [[ $# -ge 2 ]] || { echo "Missing value for --target-dir" >&2; exit 1; }
      TARGET_DIR="$2"
      shift 2
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

case "$AI_TARGET" in
  claude|cursor|windsurf|antigravity|copilot|kiro|codex|qoder|roocode|gemini|trae|opencode|continue|codebuddy|droid)
    install_to_one "$AI_TARGET"
    sync_global_rules_to_one "$AI_TARGET"
    ;;
  all)
    install_to_one "claude"
    sync_global_rules_to_one "claude"
    install_to_one "cursor"
    sync_global_rules_to_one "cursor"
    install_to_one "windsurf"
    install_to_one "antigravity"
    install_to_one "copilot"
    install_to_one "kiro"
    install_to_one "codex"
    install_to_one "qoder"
    install_to_one "roocode"
    install_to_one "gemini"
    install_to_one "trae"
    install_to_one "opencode"
    install_to_one "continue"
    install_to_one "codebuddy"
    install_to_one "droid"
    ;;
  *)
    echo "Invalid --ai value: $AI_TARGET" >&2
    usage
    exit 1
    ;;
esac

echo "Done."
