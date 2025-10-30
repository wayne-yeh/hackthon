const hre = require("hardhat");

async function main() {
  // 獲取合約實例
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TARReceipt = await hre.ethers.getContractAt("TARReceipt", contractAddress);
  
  // 後端使用的地址
  const backendAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  
  console.log("🔗 連接合約地址:", contractAddress);
  console.log("🎯 後端地址:", backendAddress);
  
  // 檢查權限
  const ISSUER_ROLE = await TARReceipt.ISSUER_ROLE();
  const hasRole = await TARReceipt.hasRole(ISSUER_ROLE, backendAddress);
  console.log("❓ 後端地址是否有 ISSUER_ROLE:", hasRole);
  
  if (hasRole) {
    console.log("🚀 測試 mint 函數...");
    const toAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const tokenUri = "ipfs://test-uri-final";
    const metadataHash = "0xebb1e2e7764b5664adab7e9e4d7ceecb7091b4dc4f3e2b8627720309aaebae0b";
    
    try {
      // 使用後端地址作為 signer
      const backendSigner = await hre.ethers.getImpersonatedSigner(backendAddress);
      const TARReceiptWithBackend = TARReceipt.connect(backendSigner);
      
      console.log("🎯 使用後端地址調用 mint...");
      const tx = await TARReceiptWithBackend.mint(toAddress, tokenUri, metadataHash);
      console.log("📝 交易哈希:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Mint 成功！");
      console.log("  Block Number:", receipt.blockNumber);
      console.log("  Gas Used:", receipt.gasUsed.toString());
      
      // 查找 Transfer 事件來獲取 tokenId
      const transferEvent = receipt.logs.find(log => {
        try {
          const parsed = TARReceipt.interface.parseLog(log);
          return parsed.name === 'Transfer';
        } catch (e) {
          return false;
        }
      });
      
      if (transferEvent) {
        const parsed = TARReceipt.interface.parseLog(transferEvent);
        console.log("🎉 Token ID:", parsed.args.tokenId.toString());
      }
      
    } catch (error) {
      console.error("❌ Mint 錯誤:", error.message);
    }
  } else {
    console.log("❌ 後端地址沒有 ISSUER_ROLE 權限");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 錯誤:", error);
    process.exit(1);
  });




