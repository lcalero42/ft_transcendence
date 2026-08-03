#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="ci-typecheck.sh"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"

source "${SCRIPT_DIR}/../utils/log.sh"

typecheck_package() {
  local target_dir="$1"
  local check_script="$2"
  local package_name
  package_name="$(basename "$(dirname "$target_dir")")"

  cd "$target_dir"

  log_group "Type-checking ${package_name} (${target_dir}) [${check_script}]"
  if ! npm run "$check_script"; then
    log_end
    log_error "TypeScript type check failed in ${package_name}"
    FAILED+=("$package_name")
    return
  fi
  log_end
  log_info "${package_name} passed"
}

FAILED=()

typecheck_package "${REPO_ROOT}/srcs/containers/back/project_volume" "typecheck"
typecheck_package "${REPO_ROOT}/srcs/containers/front/front_data" "typecheck"

if [[ ${#FAILED[@]} -gt 0 ]]; then
  log_error "TypeScript type check failed in: ${FAILED[*]}"
  exit 1
fi

log_info "TypeScript type check passed across the core project"
