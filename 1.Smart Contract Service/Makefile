# TAR Receipt Contract Makefile

.PHONY: help install compile test test-gas coverage deploy-local deploy-sepolia clean

# Default target
help:
	@echo "TAR Receipt Contract - Available Commands:"
	@echo ""
	@echo "Setup:"
	@echo "  install          Install dependencies"
	@echo "  compile          Compile contracts"
	@echo ""
	@echo "Testing:"
	@echo "  test             Run tests"
	@echo "  test-gas         Run tests with gas reporting"
	@echo "  coverage         Run test coverage"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-local     Deploy to local network"
	@echo "  deploy-sepolia   Deploy to Sepolia testnet"
	@echo ""
	@echo "Operations:"
	@echo "  set-issuer       Grant ISSUER_ROLE to issuer"
	@echo "  mint             Mint a TAR receipt"
	@echo "  revoke           Revoke a TAR receipt"
	@echo "  verify           Verify a TAR receipt"
	@echo ""
	@echo "Utilities:"
	@echo "  clean            Clean build artifacts"
	@echo "  help             Show this help message"

# Setup
install:
	npm install

compile:
	npx hardhat compile

# Testing
test:
	npx hardhat test

test-gas:
	REPORT_GAS=true npx hardhat test

coverage:
	npx hardhat coverage

# Deployment
deploy-local:
	npx hardhat run scripts/deploy.ts --network localhost

deploy-sepolia:
	npx hardhat run scripts/deploy.ts --network sepolia

# Operations
set-issuer:
	npx hardhat run scripts/setIssuer.ts --network localhost

mint:
	npx hardhat run scripts/mint.ts --network localhost

revoke:
	npx hardhat run scripts/revoke.ts --network localhost

verify:
	npx hardhat run scripts/verify.ts --network localhost

# Utilities
clean:
	npx hardhat clean
	rm -rf artifacts/
	rm -rf cache/
	rm -rf coverage/
	rm -rf typechain-types/

# Development workflow
dev-setup: install compile test
	@echo "✅ Development environment ready!"

full-test: test test-gas coverage
	@echo "✅ All tests completed!"

deploy-full: deploy-local set-issuer
	@echo "✅ Contract deployed and configured!"

# Metadata server
metadata-server:
	node metadata-server.js

# Complete flow test
test-complete: metadata-server
	@echo "🚀 Running complete TAR receipt flow test..."
	@./test-complete-flow.sh

# Quick verification test
verify-quick:
	@echo "🔍 Quick verification test..."
	@TOKEN_ID=1 npm run verify

