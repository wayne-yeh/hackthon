import { ethers } from "hardhat";
import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying TARReceipt contract...");

  // Get the contract factory
  const TARReceipt = await ethers.getContractFactory("TARReceipt");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const tarReceipt = await TARReceipt.deploy(
    "Tokenized Asset Receipt",
    "TAR",
    deployer.address
  );

  await tarReceipt.waitForDeployment();

  const contractAddress = await tarReceipt.getAddress();
  console.log("✅ TARReceipt deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contractName: "TARReceipt",
    constructorArgs: {
      name: "Tokenized Asset Receipt",
      symbol: "TAR",
      defaultAdmin: deployer.address
    }
  };

  // Create deploy directory if it doesn't exist
  const deployDir = path.join(process.cwd(), "deploy");
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  // Save addresses.json
  const addressesPath = path.join(deployDir, "addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", addressesPath);

  // Get contract ABI
  const contractArtifact = await hre.artifacts.readArtifact("TARReceipt");
  const abiPath = path.join(deployDir, "TARReceipt.json");
  fs.writeFileSync(abiPath, JSON.stringify(contractArtifact, null, 2));
  console.log("📄 Contract ABI saved to:", abiPath);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Grant ISSUER_ROLE to authorized addresses:");
  console.log(`   npx hardhat run scripts/setIssuer.ts --network ${hre.network.name}`);
  console.log("2. Mint your first TAR receipt:");
  console.log(`   npx hardhat run scripts/mint.ts --network ${hre.network.name}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
