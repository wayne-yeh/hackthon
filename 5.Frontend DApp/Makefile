.PHONY: help install dev build start test test-watch test-coverage test-e2e test-e2e-ui lint type-check clean docker-build docker-run

# Default target
help: ## Show this help message
	@echo "TAR DApp - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

# Testing commands
test: ## Run unit tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage report
	npm run test:coverage

test-e2e: ## Run E2E tests
	npm run test:e2e

test-e2e-ui: ## Run E2E tests with UI
	npm run test:e2e:ui

# Code quality commands
lint: ## Run ESLint
	npm run lint

type-check: ## Run TypeScript type checking
	npm run type-check

# Cleanup commands
clean: ## Clean build artifacts and dependencies
	rm -rf .next
	rm -rf node_modules
	rm -rf coverage
	rm -rf playwright-report
	rm -rf test-results

# Docker commands
docker-build: ## Build Docker image
	docker build -t tar-dapp .

docker-run: ## Run Docker container
	docker run -p 3000:3000 tar-dapp

# Setup commands
setup: install ## Setup project (install dependencies)
	@echo "Setting up TAR DApp..."
	@if [ ! -f .env.local ]; then \
		echo "Creating .env.local from template..."; \
		cp env.sample .env.local; \
		echo "Please edit .env.local with your configuration"; \
	fi
	@echo "Setup complete! Run 'make dev' to start development server."

# Development workflow
dev-setup: setup dev ## Setup and start development server

# Testing workflow
test-all: test test-e2e ## Run all tests (unit + E2E)

# Production workflow
prod-build: clean build ## Clean and build for production

# Quick commands
q: dev ## Quick start development server
t: test ## Quick run tests
b: build ## Quick build






