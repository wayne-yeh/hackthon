import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚫 Revoking TAR Receipt...");

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
  console.log("Issuer address:", issuer.address);

  // Check if issuer has the role
  const ISSUER_ROLE = await tarReceipt.ISSUER_ROLE();
  const hasRole = await tarReceipt.hasRole(ISSUER_ROLE, issuer.address);
  
  if (!hasRole) {
    console.error("❌ Issuer does not have ISSUER_ROLE. Please run setIssuer.ts first.");
    process.exit(1);
  }

  // Get token ID from command line arguments or use 0 as default
  const tokenId = process.argv[2] || "0";
  console.log("Token ID to revoke:", tokenId);

  // Check if token exists
  try {
    const owner = await tarReceipt.ownerOf(tokenId);
    console.log("Token owner:", owner);
  } catch (error) {
    console.error("❌ Token does not exist or is invalid");
    process.exit(1);
  }

  // Check if token is already revoked
  const isRevoked = await tarReceipt.isRevoked(tokenId);
  if (isRevoked) {
    console.log("⚠️  Token is already revoked");
    return;
  }

  // Revoke the token
  console.log("Revoking TAR receipt...");
  const tx = await tarReceipt.connect(issuer).revoke(tokenId);
  const receipt = await tx.wait();

  // Get the revoke event
  const revokedEvent = receipt?.logs.find(log => {
    try {
      const parsed = tarReceipt.interface.parseLog(log);
      return parsed?.name === "Revoked";
    } catch {
      return false;
    }
  });

  if (revokedEvent) {
    const parsed = tarReceipt.interface.parseLog(revokedEvent);
    const revokedTokenId = parsed?.args.tokenId;
    console.log("✅ TAR Receipt revoked successfully!");
    console.log("Revoked Token ID:", revokedTokenId.toString());
    console.log("Transaction hash:", tx.hash);
    
    // Verify the revocation
    console.log("\nVerification:");
    console.log("- Is Revoked:", await tarReceipt.isRevoked(tokenId));
  } else {
    console.log("✅ TAR Receipt revoked successfully!");
    console.log("Transaction hash:", tx.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
