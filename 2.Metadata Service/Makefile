.PHONY: help build test run clean docker-build docker-run docker-stop

# Default target
help:
	@echo "Available targets:"
	@echo "  build       - Build the application"
	@echo "  test        - Run tests"
	@echo "  run         - Run the application"
	@echo "  clean       - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run  - Run with Docker Compose"
	@echo "  docker-stop - Stop Docker Compose services"

# Build the application
build:
	mvn clean compile

# Run tests
test:
	mvn test

# Run tests with coverage
test-coverage:
	mvn test jacoco:report

# Run the application
run:
	mvn spring-boot:run

# Clean build artifacts
clean:
	mvn clean

# Build Docker image
docker-build:
	docker build -t tar-metadata-service .

# Run with Docker Compose
docker-run:
	docker-compose up -d

# Stop Docker Compose services
docker-stop:
	docker-compose down

# Run tests with Testcontainers
test-integration:
	mvn test -Dtest="*IntegrationTest"

# Run all tests
test-all:
	mvn test

# Check code quality
check:
	mvn checkstyle:check

# Package application
package:
	mvn clean package -DskipTests
