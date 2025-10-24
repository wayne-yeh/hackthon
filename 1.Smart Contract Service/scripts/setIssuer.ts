import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔐 Setting up ISSUER_ROLE...");

  // Load deployment info
  const addressesPath = path.join(__dirname, "../artifacts/addresses.json");
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ Deployment info not found. Please run deploy.ts first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  // Get the contract
  const TARReceipt = await ethers.getContractFactory("TARReceipt");
  const tarReceipt = TARReceipt.attach(contractAddress);

  // Get signers
  const [admin, issuer] = await ethers.getSigners();
  console.log("Admin address:", admin.address);
  console.log("Issuer address:", issuer.address);

  // Check if issuer already has the role
  const ISSUER_ROLE = await tarReceipt.ISSUER_ROLE();
  const hasRole = await tarReceipt.hasRole(ISSUER_ROLE, issuer.address);
  
  if (hasRole) {
    console.log("✅ Issuer already has ISSUER_ROLE");
    return;
  }

  // Grant ISSUER_ROLE
  console.log("Granting ISSUER_ROLE to:", issuer.address);
  const tx = await tarReceipt.grantRole(ISSUER_ROLE, issuer.address);
  await tx.wait();

  console.log("✅ ISSUER_ROLE granted successfully!");
  console.log("Transaction hash:", tx.hash);

  // Verify the role was granted
  const hasRoleAfter = await tarReceipt.hasRole(ISSUER_ROLE, issuer.address);
  console.log("Role verification:", hasRoleAfter ? "✅ Confirmed" : "❌ Failed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
