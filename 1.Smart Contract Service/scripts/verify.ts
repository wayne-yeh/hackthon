import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Verifying TAR Receipt...");

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

  // Get token ID from command line arguments or use 0 as default
  const tokenId = process.argv[2] || "0";
  console.log("Token ID to verify:", tokenId);

  // Get metadata hash from command line arguments or use a default
  const providedHash = process.argv[3] || ethers.keccak256(ethers.toUtf8Bytes("default metadata"));
  console.log("Provided metadata hash:", providedHash);

  try {
    // Check if token exists
    const owner = await tarReceipt.ownerOf(tokenId);
    console.log("Token owner:", owner);

    // Get stored metadata hash
    const storedHash = await tarReceipt.getMetaHash(tokenId);
    console.log("Stored metadata hash:", storedHash);

    // Check if token is revoked
    const isRevoked = await tarReceipt.isRevoked(tokenId);
    console.log("Is revoked:", isRevoked);

    // Verify the token
    const isValid = await tarReceipt.verify(tokenId, providedHash);
    console.log("Verification result:", isValid);

    // Display detailed verification info
    console.log("\n📋 Verification Details:");
    console.log("=".repeat(50));
    console.log("Token ID:", tokenId);
    console.log("Owner:", owner);
    console.log("Stored Hash:", storedHash);
    console.log("Provided Hash:", providedHash);
    console.log("Hash Match:", storedHash === providedHash);
    console.log("Is Revoked:", isRevoked);
    console.log("Final Result:", isValid ? "✅ VALID" : "❌ INVALID");

    if (isValid) {
      console.log("\n🎉 TAR Receipt is valid and authentic!");
    } else {
      console.log("\n⚠️  TAR Receipt verification failed!");
      if (isRevoked) {
        console.log("   Reason: Token has been revoked");
      } else if (storedHash !== providedHash) {
        console.log("   Reason: Metadata hash mismatch");
      } else {
        console.log("   Reason: Unknown verification failure");
      }
    }

  } catch (error) {
    console.error("❌ Error during verification:", error);
    console.log("Token may not exist or contract call failed");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
