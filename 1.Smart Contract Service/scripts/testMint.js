const hre = require("hardhat");

async function main() {
  // 獲取合約實例
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TARReceipt = await hre.ethers.getContractAt("TARReceipt", contractAddress);
  
  console.log("🔗 連接合約地址:", contractAddress);
  
  // 測試參數
  const toAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const tokenUri = "ipfs://test-uri";
  const metadataHash = "0xebb1e2e7764b5664adab7e9e4d7ceecb7091b4dc4f3e2b8627720309aaebae0b";
  
  console.log("🎯 測試參數:");
  console.log("  To Address:", toAddress);
  console.log("  Token URI:", tokenUri);
  console.log("  Metadata Hash:", metadataHash);
  
  try {
    // 檢查權限
    const ISSUER_ROLE = await TARReceipt.ISSUER_ROLE();
    const signer = await hre.ethers.getSigner();
    const signerAddress = await signer.getAddress();
    
    console.log("🔑 Signer Address:", signerAddress);
    console.log("🔑 ISSUER_ROLE:", ISSUER_ROLE);
    
    const hasRole = await TARReceipt.hasRole(ISSUER_ROLE, signerAddress);
    console.log("❓ Signer 是否有 ISSUER_ROLE:", hasRole);
    
    if (hasRole) {
      console.log("🚀 嘗試調用 mint 函數...");
      
      // 調用 mint 函數
      const tx = await TARReceipt.mint(toAddress, tokenUri, metadataHash);
      console.log("📝 交易哈希:", tx.hash);
      
      // 等待交易確認
      const receipt = await tx.wait();
      console.log("✅ 交易成功！");
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
      
    } else {
      console.log("❌ Signer 沒有 ISSUER_ROLE 權限");
    }
    
  } catch (error) {
    console.error("❌ 錯誤:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 錯誤:", error);
    process.exit(1);
  });





