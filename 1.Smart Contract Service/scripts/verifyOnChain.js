
const { ethers } = require('hardhat');

async function main() {
    const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    const contract = await ethers.getContractAt('TARReceipt', contractAddress);
    
    console.log('📊 查詢鏈上數據...');
    const txHash = '0x12ef461ed8702586f3540a048a335481e7b75946bd19c4d8bac5e93a59a6f5d6';
    const tx = await ethers.provider.getTransaction(txHash);
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    
    console.log('✅ 交易狀態:', receipt.status === 1 ? '成功' : '失敗');
    console.log('📍 區塊號:', receipt.blockNumber);
    console.log('📝 交易哈希:', receipt.transactionHash);
    console.log('⛽ Gas 使用量:', receipt.gasUsed.toString());
    
    // 查詢合約中的 token 總數
    const totalSupply = await contract.totalSupply ? await contract.totalSupply() : null;
    if (totalSupply !== null) {
        console.log('📊 鏈上總 Token 數:', totalSupply.toString());
    }
}

main().catch(console.error);

