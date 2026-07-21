# =============================================================================
# Transcendance - Makefile
# =============================================================================

COMPOSE_FILE := srcs/docker-compose.yml
COMPOSE      := docker compose -f $(COMPOSE_FILE)
LOG_DIR      := logs

.PHONY: all up down front back re re-front re-back \
        logs logs-front ps clean fclean prisma-migrate \
		prisma-generate help

# -----------------------------------------------------------------------------
# Default target
# -----------------------------------------------------------------------------
all: up

# -----------------------------------------------------------------------------
# Build & run
# -----------------------------------------------------------------------------
up: ## Build and start all services (front + back + postgres)
	$(COMPOSE) up --build -d

down: ## Stop and remove all containers
	$(COMPOSE) down

front: ## Build and start only the front service
	$(COMPOSE) up --build -d front

back: ## Build and start only the back service (+ postgres if needed)
	$(COMPOSE) up --build -d back

# -----------------------------------------------------------------------------
# Rebuild
# -----------------------------------------------------------------------------
re: down up ## Full rebuild of the whole stack (down + up, keeps volumes)

re-front: ## Rebuild only the front service
	$(COMPOSE) stop front
	$(COMPOSE) rm -f front
	$(COMPOSE) up --build -d front

re-back: ## Rebuild only the back service
	$(COMPOSE) stop back
	$(COMPOSE) rm -f back
	$(COMPOSE) up --build -d back

# -----------------------------------------------------------------------------
# Logs
# -----------------------------------------------------------------------------
logs: ## Tail logs for all services
	$(COMPOSE) logs -f

logs-front: ## Tail logs for the front service only
	$(COMPOSE) logs -f front

logs-back: ## Tail logs for the back service only
	$(COMPOSE) logs -f back

# -----------------------------------------------------------------------------
# Status
# -----------------------------------------------------------------------------
ps: ## Show status of running containers
	$(COMPOSE) ps

# -----------------------------------------------------------------------------
# Cleaning
# -----------------------------------------------------------------------------
clean: ## Stop containers and remove associated images/networks (keeps volumes)
	$(COMPOSE) down --rmi all

fclean: clean ## Full clean: also remove named volumes (postgres data, etc.)
	$(COMPOSE) down -v --rmi all
	docker system prune -f

# -----------------------------------------------------------------------------
# Prisma helpers (back)
# -----------------------------------------------------------------------------
prisma-migrate: ## Run Prisma migrations inside the back container
	$(COMPOSE) exec back npx prisma migrate dev

prisma-generate: ## Regenerate Prisma client inside the back container
	$(COMPOSE) exec back npx prisma generate

# -----------------------------------------------------------------------------
# Help
# -----------------------------------------------------------------------------
help: ## Show this help message
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
