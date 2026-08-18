# =============================================================================
# Transcendance - Makefile
# =============================================================================

COMPOSE_FILE := srcs/docker-compose.yml
COMPOSE      := docker compose -f $(COMPOSE_FILE)
LOG_DIR      := logs
PROJECT_NAME := $(shell basename $$(pwd))

ROOT_ENV_FILE := srcs/.env
BACK_ENV_FILE := srcs/containers/back/project_volume/.env
ENV_FILES     := $(ROOT_ENV_FILE) $(BACK_ENV_FILE)

SECRETS_DIR  := srcs/secrets
SECRETS      := db_user.txt db_password.txt db_name.txt

RED    := \033[0;31m
YELLOW := \033[0;33m
CYAN   := \033[0;36m
NC     := \033[0m

.PHONY: all build buildd up upd down front back re re-front re-back \
        logs logs-front logs-back ps \
        clean fclean \
        prisma-migrate prisma-generate \
        check-env check-secrets check-containers-up \
        check-lint check-lint-fix check-typecheck check-all \
        help

.DEFAULT_GOAL := help

# -----------------------------------------------------------------------------
# Default target
# -----------------------------------------------------------------------------
all: help

##@ Safety Checks

check-env: ## Verify all required .env files exist and PROJECT_PATH is set in srcs/.env
	@for f in $(ENV_FILES); do \
		if [ ! -f "$$f" ]; then \
			printf "$(RED)Error:$(NC) $$f not found.\n"; \
			printf "$(YELLOW)Fix:$(NC) create $$f before running make (see README).\n"; \
			exit 1; \
		fi; \
		if [ ! -s "$$f" ]; then \
			printf "$(RED)Error:$(NC) $$f is empty.\n"; \
			printf "$(YELLOW)Fix:$(NC) fill in $$f before running make (see README).\n"; \
			exit 1; \
		fi; \
	done
	@value=$$(grep -E '^PROJECT_PATH=' $(ROOT_ENV_FILE) | cut -d '=' -f2-); \
	if [ -z "$$value" ]; then \
		printf "$(RED)Error:$(NC) PROJECT_PATH is missing or empty in $(ROOT_ENV_FILE)\n"; \
		printf "$(YELLOW)Fix:$(NC) add this line to $(ROOT_ENV_FILE):\n"; \
		printf "  PROJECT_PATH=$$(pwd)\n"; \
		exit 1; \
	fi

check-secrets: ## Verify secret files exist and are not empty
	@for f in $(SECRETS); do \
		if [ ! -f "$(SECRETS_DIR)/$$f" ]; then \
			printf "$(RED)Error:$(NC) missing $(SECRETS_DIR)/$$f - see README for secrets setup\n"; \
			exit 1; \
		fi; \
		if [ ! -s "$(SECRETS_DIR)/$$f" ]; then \
			printf "$(RED)Error:$(NC) $(SECRETS_DIR)/$$f is empty - fill it in before running make\n"; \
			exit 1; \
		fi; \
	done

##@ CI / Checks

check-containers-up: ## Verify front & back containers are running (checks execute inside them)
	@running="$$($(COMPOSE) ps --status running --services)"; \
	for svc in front back; do \
		if ! printf '%s\n' "$$running" | grep -qx "$$svc"; then \
			printf "$(RED)Error:$(NC) '$$svc' container is not running.\n"; \
			printf "$(YELLOW)Fix:$(NC) run 'make up' or 'make buildd' first.\n"; \
			exit 1; \
		fi; \
	done

check-lint: check-containers-up ## Run eslint inside the front & back containers
	@printf "$(CYAN)Linting back...$(NC)\n"
	$(COMPOSE) exec back npm run lint:check
	@printf "$(CYAN)Linting front...$(NC)\n"
	$(COMPOSE) exec front npm run lint

check-lint-fix: check-containers-up ## Run eslint --fix inside the front & back containers
	@printf "$(CYAN)Linting (fix) back...$(NC)\n"
	$(COMPOSE) exec back npm run lint
	@printf "$(CYAN)Linting (fix) front...$(NC)\n"
	$(COMPOSE) exec front npm run lint:fix

check-typecheck: check-containers-up ## Run typecheck inside the front & back containers
	@printf "$(CYAN)Type-checking back...$(NC)\n"
	$(COMPOSE) exec back npm run typecheck
	@printf "$(CYAN)Type-checking front...$(NC)\n"
	$(COMPOSE) exec front npm run typecheck

check-all: check-containers-up ## Run all checks (eslint + typecheck) inside the containers and report which ones failed
	@FAILED=""; \
	printf "$(CYAN)Running lint (back)...$(NC)\n"; \
	$(COMPOSE) exec back npm run lint:check || FAILED="$$FAILED lint(back)"; \
	printf "$(CYAN)Running lint (front)...$(NC)\n"; \
	$(COMPOSE) exec front npm run lint || FAILED="$$FAILED lint(front)"; \
	printf "$(CYAN)Running typecheck (back)...$(NC)\n"; \
	$(COMPOSE) exec back npm run typecheck || FAILED="$$FAILED typecheck(back)"; \
	printf "$(CYAN)Running typecheck (front)...$(NC)\n"; \
	$(COMPOSE) exec front npm run typecheck || FAILED="$$FAILED typecheck(front)"; \
	if [ -n "$$FAILED" ]; then \
		printf "$(RED)Failed checks:$(NC)%s\n" "$$FAILED"; \
		exit 1; \
	else \
		printf "$(YELLOW)All checks passed.$(NC)\n"; \
	fi

##@ Build & Run

build: check-env check-secrets ## Build and start attached all services (front + back + postgres) loading in the background.
	$(COMPOSE) up --build

buildd: check-env check-secrets ## Build and start all services (front + back + postgres) loading in the background.
	$(COMPOSE) up --build -d

up: check-env check-secrets ## Start all services (front + back + postgres) attached
	$(COMPOSE) up

upd: check-env check-secrets ## Start all services (front + back + postgres) detached
	$(COMPOSE) up -d

down: ## Stop and remove all containers
	$(COMPOSE) down

front: check-env check-secrets ## Build and start only the front service
	$(COMPOSE) up --build -d front

back: check-env check-secrets ## Build and start only the back service (+ postgres if needed)
	$(COMPOSE) up --build -d back

##@ Rebuild

re: down up ## Full rebuild of the whole stack (down + up, keeps volumes)

re-front: check-env check-secrets ## Rebuild only the front service
	$(COMPOSE) stop front && \
	$(COMPOSE) rm -f front && \
	$(COMPOSE) up --build -d front

re-back: check-env check-secrets ## Rebuild only the back service
	$(COMPOSE) stop back && \
	$(COMPOSE) rm -f back && \
	$(COMPOSE) up --build -d back

##@ Logs & Status

logs: ## Tail logs for all services
	$(COMPOSE) logs -f

logs-front: ## Tail logs for the front service only
	$(COMPOSE) logs -f front

logs-back: ## Tail logs for the back service only
	$(COMPOSE) logs -f back

ps: ## Show status of running containers
	$(COMPOSE) ps

##@ Prisma (back)

prisma-migrate: ## Run Prisma migrations inside the back container
	$(COMPOSE) exec back npx prisma migrate dev

prisma-generate: ## Regenerate Prisma client inside the back container
	$(COMPOSE) exec back npx prisma generate

##@ Cleaning

clean: ## Stop containers and remove associated images/networks (keeps volumes)
	$(COMPOSE) down --rmi all

fclean: ## Full clean: also remove named volumes (asks for confirmation, scoped to this project only)
	@printf "$(YELLOW)WARNING:$(NC) this will remove all containers, images AND named volumes (e.g. postgres data) for this project only.\n"
	@read -p "Are you sure? [y/N] " confirm && \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
			$(COMPOSE) down -v --rmi all && \
			docker image prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)" && \
			docker volume prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)" && \
			docker network prune -f --filter "label=com.docker.compose.project=$(PROJECT_NAME)"; \
		else \
			printf "$(CYAN)Aborted.$(NC)\n"; \
		fi

##@ Help

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2 } \
	/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo ""
