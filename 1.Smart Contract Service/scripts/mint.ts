import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🎨 Minting TAR Receipt...");

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
  const [admin, issuer, buyer] = await ethers.getSigners();
  console.log("Issuer address:", issuer.address);
  console.log("Buyer address:", buyer.address);

  // Check if issuer has the role
  const ISSUER_ROLE = await tarReceipt.ISSUER_ROLE();
  const hasRole = await tarReceipt.hasRole(ISSUER_ROLE, issuer.address);
  
  if (!hasRole) {
    console.error("❌ Issuer does not have ISSUER_ROLE. Please run setIssuer.ts first.");
    process.exit(1);
  }

  // Mint parameters
  const tokenURI = "https://example.com/metadata/tar-receipt-1";
  const metadataContent = JSON.stringify({
    name: "Tokenized Asset Receipt #1",
    description: "A tokenized asset receipt for a valuable asset",
    image: "https://example.com/images/tar-1.png",
    attributes: [
      { trait_type: "Asset Type", value: "Real Estate" },
      { trait_type: "Location", value: "Taipei, Taiwan" },
      { trait_type: "Value", value: "1000000 USD" }
    ]
  });
  const metaHash = ethers.keccak256(ethers.toUtf8Bytes(metadataContent));

  console.log("Minting parameters:");
  console.log("- Token URI:", tokenURI);
  console.log("- Metadata Hash:", metaHash);
  console.log("- Recipient:", buyer.address);

  // Mint the token
  console.log("Minting TAR receipt...");
  const tx = await tarReceipt.connect(issuer).mint(buyer.address, tokenURI, metaHash);
  const receipt = await tx.wait();

  // Get the token ID from the event
  const mintedEvent = receipt?.logs.find(log => {
    try {
      const parsed = tarReceipt.interface.parseLog(log);
      return parsed?.name === "Minted";
    } catch {
      return false;
    }
  });

  if (mintedEvent) {
    const parsed = tarReceipt.interface.parseLog(mintedEvent);
    const tokenId = parsed?.args.tokenId;
    console.log("✅ TAR Receipt minted successfully!");
    console.log("Token ID:", tokenId.toString());
    console.log("Transaction hash:", tx.hash);
    
    // Verify the mint
    console.log("\nVerification:");
    console.log("- Owner:", await tarReceipt.ownerOf(tokenId));
    console.log("- Token URI:", await tarReceipt.tokenURI(tokenId));
    console.log("- Meta Hash:", await tarReceipt.getMetaHash(tokenId));
    console.log("- Is Revoked:", await tarReceipt.isRevoked(tokenId));
  } else {
    console.log("✅ TAR Receipt minted successfully!");
    console.log("Transaction hash:", tx.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
