const { ethers } = require('hardhat');

async function main() {
    console.log('🔍 查詢錢包 Token 餘額...\n');
    
    const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    
    try {
        // 獲取合約實例
        const contract = await ethers.getContractAt('TARReceipt', contractAddress);
        
        console.log('📋 合約信息:');
        console.log('   合約地址:', contractAddress);
        console.log('   查詢地址:', walletAddress);
        console.log('');
        
        // 查詢餘額
        const balance = await contract.balanceOf(walletAddress);
        console.log('💰 Token 餘額:', balance.toString());
        
        // 查詢總供應量 (如果方法存在)
        try {
            const totalSupply = await contract.totalSupply();
            console.log('📊 總供應量:', totalSupply.toString());
        } catch (e) {
            console.log('⚠️  合約沒有 totalSupply 方法');
        }
        
        // 查詢合約名稱和符號 (如果方法存在)
        try {
            const name = await contract.name();
            const symbol = await contract.symbol();
            console.log('🏷️  合約名稱:', name);
            console.log('🔤 合約符號:', symbol);
        } catch (e) {
            console.log('⚠️  合約沒有 name/symbol 方法');
        }
        
        // 查詢該地址擁有的所有 token ID
        console.log('\n🔍 查詢該地址擁有的所有 Token ID...');
        const tokenCount = Number(balance.toString());
        
        if (tokenCount > 0) {
            console.log(`📝 找到 ${tokenCount} 個 Token:`);
            for (let i = 0; i < tokenCount; i++) {
                try {
                    const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
                    console.log(`   Token #${i + 1}: ID ${tokenId.toString()}`);
                } catch (e) {
                    console.log(`   Token #${i + 1}: 無法查詢 ID (可能沒有 tokenOfOwnerByIndex 方法)`);
                }
            }
        } else {
            console.log('❌ 該地址沒有 Token');
        }
        
        // 驗證合約是否正確部署
        console.log('\n🔍 驗證合約部署...');
        const code = await ethers.provider.getCode(contractAddress);
        if (code === '0x') {
            console.log('❌ 合約未部署或地址錯誤');
        } else {
            console.log('✅ 合約已正確部署');
            console.log('   合約代碼長度:', code.length, '字符');
        }
        
    } catch (error) {
        console.error('❌ 查詢失敗:', error.message);
        
        // 提供調試信息
        console.log('\n🔧 調試信息:');
        console.log('   網絡:', await ethers.provider.getNetwork());
        console.log('   當前區塊:', await ethers.provider.getBlockNumber());
        
        // 檢查合約地址是否有代碼
        const code = await ethers.provider.getCode(contractAddress);
        console.log('   合約代碼存在:', code !== '0x');
    }
}

main().catch(console.error);
