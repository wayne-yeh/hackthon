.PHONY: help build test run clean docker-build docker-up docker-down coverage

help:
	@echo "Available targets:"
	@echo "  build         - Build the application"
	@echo "  test          - Run all tests"
	@echo "  run           - Run the application locally"
	@echo "  clean         - Clean build artifacts"
	@echo "  docker-build  - Build Docker image"
	@echo "  docker-up     - Start Docker containers"
	@echo "  docker-down   - Stop Docker containers"
	@echo "  coverage      - Generate test coverage report"
	@echo "  swagger       - Open Swagger UI"

build:
	@echo "Building application..."
	./mvnw clean package -DskipTests

test:
	@echo "Running tests..."
	./mvnw test

test-integration:
	@echo "Running integration tests..."
	./mvnw verify

run:
	@echo "Starting application..."
	./mvnw spring-boot:run

clean:
	@echo "Cleaning build artifacts..."
	./mvnw clean

docker-build:
	@echo "Building Docker image..."
	docker build -t tar-backend-api:latest .

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Backend API is running at http://localhost:8080"
	@echo "Swagger UI is available at http://localhost:8080/swagger-ui.html"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

docker-logs:
	docker-compose logs -f backend-api

coverage:
	@echo "Generating test coverage report..."
	./mvnw clean test jacoco:report
	@echo "Coverage report generated at target/site/jacoco/index.html"

swagger:
	@echo "Opening Swagger UI..."
	open http://localhost:8080/swagger-ui.html || xdg-open http://localhost:8080/swagger-ui.html

install-mvn-wrapper:
	@if [ ! -f "./mvnw" ]; then \
		echo "Installing Maven Wrapper..."; \
		mvn -N wrapper:wrapper; \
	fi

setup: install-mvn-wrapper
	@echo "Setting up project..."
	@cp .env.sample .env || true
	@echo "Project setup complete. Please edit .env file with your configuration."

all: clean build test

deploy-local: build docker-build docker-up
	@echo "Local deployment complete!"


