# TAR Verification Service Makefile

.PHONY: help build test test-coverage run clean docker-build docker-run docker-compose-up docker-compose-down lint format

# Default target
help:
	@echo "TAR Verification Service - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  build          - Build the application"
	@echo "  test           - Run all tests"
	@echo "  test-coverage  - Run tests with coverage report"
	@echo "  run            - Run the application locally"
	@echo "  clean          - Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  docker-compose-up   - Start with docker-compose"
	@echo "  docker-compose-down - Stop docker-compose"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint           - Run code linting"
	@echo "  format         - Format code"
	@echo ""
	@echo "Utilities:"
	@echo "  install-deps   - Install dependencies"
	@echo "  verify-setup   - Verify development setup"

# Development commands
build:
	@echo "Building TAR Verification Service..."
	./mvnw clean compile

test:
	@echo "Running tests..."
	./mvnw test

test-coverage:
	@echo "Running tests with coverage..."
	./mvnw clean test jacoco:report
	@echo "Coverage report generated at: target/site/jacoco/index.html"

run:
	@echo "Starting TAR Verification Service..."
	./mvnw spring-boot:run

clean:
	@echo "Cleaning build artifacts..."
	./mvnw clean

# Docker commands
docker-build:
	@echo "Building Docker image..."
	docker build -t tar-verification-service:latest .

docker-run:
	@echo "Running Docker container..."
	docker run -d \
		--name tar-verification-service \
		-p 8082:8082 \
		-e BLOCKCHAIN_RPC_URL=http://host.docker.internal:8545 \
		-e CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3 \
		-e METADATA_SERVICE_URL=http://host.docker.internal:8081 \
		tar-verification-service:latest

docker-compose-up:
	@echo "Starting services with docker-compose..."
	docker-compose up -d

docker-compose-down:
	@echo "Stopping services..."
	docker-compose down

# Code quality commands
lint:
	@echo "Running code linting..."
	./mvnw checkstyle:check

format:
	@echo "Formatting code..."
	./mvnw spotless:apply

# Utility commands
install-deps:
	@echo "Installing dependencies..."
	./mvnw dependency:resolve

verify-setup:
	@echo "Verifying development setup..."
	@echo "Java version:"
	@java -version
	@echo ""
	@echo "Maven version:"
	@./mvnw --version
	@echo ""
	@echo "Docker version:"
	@docker --version
	@echo ""
	@echo "Setup verification complete!"

# API testing commands
test-api:
	@echo "Testing API endpoints..."
	@echo "Health check:"
	@curl -s http://localhost:8082/api/verify/health || echo "Service not running"
	@echo ""
	@echo "Swagger UI available at: http://localhost:8082/swagger-ui.html"

# Development workflow
dev-start: build test run

dev-stop:
	@echo "Stopping development environment..."
	@pkill -f "spring-boot:run" || true
	@docker stop tar-verification-service || true
	@docker rm tar-verification-service || true

# CI/CD commands
ci-build: clean build test-coverage lint

ci-deploy: docker-build docker-compose-up

# Environment setup
setup-env:
	@echo "Setting up environment..."
	@if [ ! -f .env ]; then \
		cp env.sample .env; \
		echo "Created .env file from env.sample"; \
		echo "Please edit .env with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

# Logs
logs:
	@echo "Showing application logs..."
	@docker logs -f tar-verification-service || tail -f logs/verification-service.log

# Status check
status:
	@echo "Checking service status..."
	@curl -s http://localhost:8082/api/verify/health && echo "Service is running" || echo "Service is not running"
