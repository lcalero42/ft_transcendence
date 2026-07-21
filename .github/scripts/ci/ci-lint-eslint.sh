#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="ci-lint-eslint.sh"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"

source "${SCRIPT_DIR}/../utils/log.sh"

EXPECTED_PNPM="10.11.0"

FIX=false
if [[ "${1:-}" == "--fix" ]]; then
  FIX=true
fi

lint_package() {
  local target_dir="$1"
  local check_script="$2"
  local fix_script="$3"
  local package_name
  package_name="$(basename "$(dirname "$target_dir")")"

  local target_script="$check_script"
  if [[ "$FIX" == true ]]; then
    target_script="$fix_script"
  fi

  cd "$target_dir"

  local actual_pnpm
  actual_pnpm="$(pnpm --version)"
  if [[ "$actual_pnpm" != "$EXPECTED_PNPM" ]]; then
    log_error "Expected pnpm ${EXPECTED_PNPM} in ${target_dir}, found ${actual_pnpm}."
    FAILED+=("$package_name")
    return
  fi

  log_group "Linting ${package_name} (${target_dir}) [${target_script}]"
  if ! pnpm run "$target_script"; then
    log_end
    log_error "ESLint failed in ${package_name}"
    FAILED+=("$package_name")
    return
  fi
  log_end
  log_info "${package_name} passed"
}

FAILED=()

lint_package "${REPO_ROOT}/srcs/containers/back/project_volume" "lint:check" "lint"
lint_package "${REPO_ROOT}/srcs/containers/front/front_data" "lint" "lint"

if [[ ${#FAILED[@]} -gt 0 ]]; then
  log_error "ESLint failed in: ${FAILED[*]}"
  exit 1
fi

log_info "ESLint passed across the core project"
