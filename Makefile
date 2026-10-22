# =============================================================================
# Transcendance - Makefile
# =============================================================================

COMPOSE_FILE      := srcs/docker-compose.yml
COMPOSE_DEV_FILE  := srcs/docker-compose.dev.yml
COMPOSE_PROD_FILE := srcs/docker-compose.prod.yml
COMPOSE_DEV       := docker compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE)
COMPOSE_PROD      := docker compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE)
COMPOSE           := $(COMPOSE_DEV)

# Docker Compose defaults the project name to the basename of the directory
# containing the compose file (not the repo root / cwd) — must match that
# so the `docker ... prune --filter label=com.docker.compose.project=...`
# calls in fclean actually match the running stack's resources.
PROJECT_NAME := $(notdir $(patsubst %/,%,$(dir $(COMPOSE_FILE))))

ROOT_ENV_FILE  := srcs/.env
BACK_ENV_FILE  := srcs/containers/back/project_volume/.env
FRONT_ENV_FILE := srcs/containers/front/front_data/.env
ENV_FILES      := $(ROOT_ENV_FILE) $(BACK_ENV_FILE) $(FRONT_ENV_FILE)

SECRETS_DIR  := srcs/secrets
SECRETS      := db_user.txt db_password.txt db_name.txt jwt_secret.txt internal_api_key.txt admin_email.txt admin_password.txt \
               google_client_id.txt google_client_secret.txt discord_client_id.txt discord_client_secret.txt

RED    := \033[0;31m
YELLOW := \033[0;33m
CYAN   := \033[0;36m
NC     := \033[0m

.PHONY: all dev prod build buildd up upd down front back re re-front re-back \
        logs logs-front logs-back logs-nginx ps \
        clean fclean \
        prisma-migrate prisma-generate bots \
        check-env check-secrets check-containers-up \
        check-lint check-lint-fix check-typecheck check-all check-build check-build test \
        help

.DEFAULT_GOAL := help

define check_running
	@running="$$($(1) ps --status running --services)"; \
	for svc in $(2); do \
		if ! printf '%s\n' "$$running" | grep -qx "$$svc"; then \
			printf "$(RED)Error:$(NC) '$$svc' container is not running.\n"; \
			printf "$(YELLOW)Fix:$(NC) $(3)\n"; \
			exit 1; \
		fi; \
	done
endef

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

check-containers-up: ## Verify the dev stack (nginx, front, back & postgres) is running (checks execute inside it)
	$(call check_running,$(COMPOSE_DEV),nginx front back postgres,run 'make dev' or 'make upd' first (checks need the dev stack).)

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

check-all: check-containers-up test ## Run all checks (eslint + typecheck) inside the containers, continuing past failures
	@$(MAKE) --no-print-directory -k check-lint check-typecheck

check-build: check-env check-secrets ## Build the prod stack, verify nginx serves the front and the API, then tear down (CI)
	@printf "$(CYAN)Building and starting prod stack...$(NC)\n"
	$(COMPOSE_PROD) up --build -d --remove-orphans --wait --wait-timeout 180
	$(call check_running,$(COMPOSE_PROD),nginx back postgres,check 'make logs' for the failing service.)
	@port=$$(grep -E '^HTTPS_PORT=' $(ROOT_ENV_FILE) | cut -d '=' -f2-); \
	port=$${port:-8443}; \
	for path in / /api/; do \
		url="https://localhost:$$port$$path"; \
		tries=0; \
		until curl -fsk -o /dev/null "$$url"; do \
			tries=$$((tries + 1)); \
			if [ $$tries -ge 30 ]; then \
				printf "$(RED)Error:$(NC) $$url did not answer through nginx.\n"; \
				printf "$(YELLOW)Fix:$(NC) check 'make logs' (the stack is left running).\n"; \
				exit 1; \
			fi; \
			sleep 2; \
		done; \
		printf "$(CYAN)OK:$(NC) $$url\n"; \
	done; \
	for path in / /index.html /api/; do \
		url="https://localhost:$$port$$path"; \
		headers=$$(curl -skI "$$url"); \
		for header in Content-Security-Policy Strict-Transport-Security X-Frame-Options X-Content-Type-Options Referrer-Policy; do \
			if ! printf '%s\n' "$$headers" | grep -qi "^$$header:"; then \
				printf "$(RED)Error:$(NC) $$url is missing the $$header header.\n"; \
				printf "$(YELLOW)Fix:$(NC) check srcs/containers/nginx/conf/security-headers.conf and its includes.\n"; \
				exit 1; \
			fi; \
		done; \
		printf "$(CYAN)OK:$(NC) security headers on $$url\n"; \
	done
	@printf "$(CYAN)Prod stack built and serving through nginx. Tearing down...$(NC)\n"
	$(COMPOSE_PROD) down

test: check-containers-up ## Run backend Jest tests inside the back container
	@printf "$(CYAN)Running backend tests...$(NC)\n"
	$(COMPOSE) exec back npm run test

##@ Build & Run

dev: check-env check-secrets ## Build and start the dev stack attached (hot reload, Studio, demo data), app on https://localhost:8443
	$(COMPOSE_DEV) up --build --remove-orphans

prod: check-env check-secrets ## Build and start the prod stack detached (optimized build, only nginx exposed), app on https://localhost:8443
	$(COMPOSE_PROD) up --build -d --remove-orphans

up: dev ## Alias of dev

upd: check-env check-secrets ## Build and start the dev stack detached
	$(COMPOSE_DEV) up --build -d --remove-orphans

build: dev ## Alias of dev

buildd: upd ## Alias of upd

down: ## Stop and remove all containers (dev or prod)
	$(COMPOSE) down --remove-orphans

front: check-env check-secrets ## Build and start only the front service
	$(COMPOSE) up --build -d front

back: check-env check-secrets ## Build and start only the back service (+ postgres if needed)
	$(COMPOSE) up --build -d back

##@ Rebuild

re: down dev ## Full rebuild of the dev stack (down + dev, keeps volumes)

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

logs-nginx: ## Tail logs for the nginx service only
	$(COMPOSE) logs -f nginx

ps: ## Show status of running containers
	$(COMPOSE) ps

##@ Prisma (back)

prisma-migrate: ## Run Prisma migrations inside the back container
	$(COMPOSE) exec back npx prisma migrate dev

prisma-generate: ## Regenerate Prisma client inside the back container
	$(COMPOSE) exec back npx prisma generate

##@ Dev tools

bots: check-containers-up ## Run the Undercover bots inside the back container (e.g. make bots ARGS="--create")
	$(COMPOSE) exec back npm run bots -- $(ARGS)

##@ Cleaning

clean: ## Stop containers and remove dev and prod images/networks (keeps volumes)
	$(COMPOSE_DEV) down --rmi all --remove-orphans
	$(COMPOSE_PROD) down --rmi all --remove-orphans

fclean: ## Full clean: also remove dev and prod named volumes (asks for confirmation, scoped to this project only)
	@printf "$(YELLOW)WARNING:$(NC) this will remove all containers, images AND named volumes (postgres data, avatars, certificate) for this project only.\n"
	@read -p "Are you sure? [y/N] " confirm && \
		if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
			$(COMPOSE_DEV) down -v --rmi all --remove-orphans && \
			$(COMPOSE_PROD) down -v --rmi all --remove-orphans && \
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
