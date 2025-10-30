const hre = require("hardhat");

async function main() {
  // 獲取合約實例
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TARReceipt = await hre.ethers.getContractAt("TARReceipt", contractAddress);
  
  // 後端使用的地址
  const backendAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  
  console.log("🔗 連接合約地址:", contractAddress);
  console.log("🎯 後端地址:", backendAddress);
  
  // 獲取 ISSUER_ROLE
  const ISSUER_ROLE = await TARReceipt.ISSUER_ROLE();
  console.log("🔑 ISSUER_ROLE:", ISSUER_ROLE);
  
  // 檢查當前權限
  const hasRole = await TARReceipt.hasRole(ISSUER_ROLE, backendAddress);
  console.log("❓ 當前是否有 ISSUER_ROLE:", hasRole);
  
  if (!hasRole) {
    console.log("🚀 正在授予 ISSUER_ROLE 權限...");
    
    // 授予權限
    const tx = await TARReceipt.grantRole(ISSUER_ROLE, backendAddress);
    console.log("📝 交易哈希:", tx.hash);
    
    // 等待交易確認
    await tx.wait();
    console.log("✅ 權限授予成功！");
    
    // 再次檢查權限
    const newHasRole = await TARReceipt.hasRole(ISSUER_ROLE, backendAddress);
    console.log("✅ 確認權限:", newHasRole);
  } else {
    console.log("✅ 地址已經有 ISSUER_ROLE 權限");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 錯誤:", error);
    process.exit(1);
  });




