#!/bin/bash

mkdir -p logs

echo "Start Smart Contract Service (Hardhat node)..."
cd "1.Smart Contract Service" || exit
npx hardhat node > ../logs/hardhat-node.log 2>&1 &
HARDHAT_PID=$!
sleep 5

echo "Deploying contracts..."
npx hardhat run scripts/deploy.ts --network localhost > ../logs/hardhat-deploy.log 2>&1

echo "Granting Issuer role..."
npx hardhat run scripts/grantIssuerRole.js --network localhost > ../logs/hardhat-grant.log 2>&1
cd ..

echo "Start Metadata Service..."
cd "2.Metadata Service" || exit
mvn spring-boot:run > ../logs/metadata.log 2>&1 &
METADATA_PID=$!
cd ..

echo "Start Backend Core API..."
cd "3.Backend Core API" || exit
mvn spring-boot:run > ../logs/backend-core.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Start Verification Service..."
cd "4.Verification Service" || exit
mvn spring-boot:run > ../logs/verification.log 2>&1 &
VERIFICATION_PID=$!
cd ..

echo "Start Frontend DApp..."
cd "5.Frontend DApp" || exit
make dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "All services started."
echo "Logs are in the logs/ directory."

echo "Hardhat Node PID: $HARDHAT_PID"
echo "Metadata Service PID: $METADATA_PID"
echo "Backend Core API PID: $BACKEND_PID"
echo "Verification Service PID: $VERIFICATION_PID"
echo "Frontend DApp PID: $FRONTEND_PID"

echo ""
echo "To stop all services, run:"
echo "kill $HARDHAT_PID $METADATA_PID $BACKEND_PID $VERIFICATION_PID $FRONTEND_PID"
