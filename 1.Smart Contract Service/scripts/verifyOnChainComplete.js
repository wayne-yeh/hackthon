const { ethers } = require('hardhat');

async function main() {
    console.log('🔍 檢查交易是否在鏈上...\n');
    
    const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    
    // 查詢多個交易
    const transactions = [
        '0x12ef461ed8702586f3540a048a335481e7b75946bd19c4d8bac5e93a59a6f5d6',
        '0x2fc9085de7b3adc52cec2ac7cbf39914a76197260a9dd8741b7e1134fc76f898',
        '0xffd090b870f7049df15437999bbaf7928e932881d8ec3e997cc390044d27c7a9',
        '0x239b34920cee8eb7057f7526df0b423734eabeb48762f65e90311f6c96179c29',
        '0xf92346d5ed7a66ff8cfd705b8a38b5c7069812e10fadfff73881eae68d4d661c'
    ];
    
    for (const txHash of transactions) {
        try {
            console.log(`\n📝 檢查交易: ${txHash.substring(0, 20)}...`);
            const tx = await ethers.provider.getTransaction(txHash);
            
            if (tx) {
                const receipt = await ethers.provider.getTransactionReceipt(txHash);
                console.log('✅ 交易存在於鏈上');
                console.log('   📦 區塊號:', receipt.blockNumber);
                console.log('   ⛽ Gas 使用:', receipt.gasUsed.toString());
                console.log('   📍 狀態:', receipt.status === 1 ? '成功 ✅' : '失敗 ❌');
            } else {
                console.log('❌ 交易不存在');
            }
        } catch (e) {
            console.log('❌ 交易查詢失敗:', e.message);
        }
    }
    
    // 查詢當前區塊高度
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`\n📊 當前區塊高度: ${blockNumber}`);
    
    // 查詢合約
    try {
        const contract = await ethers.getContractAt('TARReceipt', contractAddress);
        const [owner] = await ethers.getSigners();
        const balance = await contract.balanceOf(owner.address);
        console.log(`\n👤 Owner ${owner.address} 擁有 Token 數量: ${balance.toString()}`);
    } catch (e) {
        console.log('⚠️ 無法查詢合約:', e.message);
    }
}

main().catch(console.error);

