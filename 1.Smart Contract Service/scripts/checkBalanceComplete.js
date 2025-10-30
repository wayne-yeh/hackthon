const { ethers } = require('hardhat');

async function main() {
    console.log('🔍 完整查詢錢包 Token 信息...\n');
    
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    
    try {
        // 獲取合約實例
        const contract = await ethers.getContractAt('TARReceipt', contractAddress);
        
        console.log('📋 合約信息:');
        console.log('   合約地址:', contractAddress);
        console.log('   查詢地址:', walletAddress);
        console.log('   合約名稱:', await contract.name());
        console.log('   合約符號:', await contract.symbol());
        console.log('');
        
        // 查詢餘額
        const balance = await contract.balanceOf(walletAddress);
        console.log('💰 Token 餘額:', balance.toString());
        
        // 查詢當前 Token ID 計數器
        const currentTokenId = await contract.getCurrentTokenId();
        console.log('🔢 當前 Token ID 計數器:', currentTokenId.toString());
        
        // 查詢合約是否暫停
        const isPaused = await contract.paused();
        console.log('⏸️  合約狀態:', isPaused ? '已暫停' : '正常運行');
        
        // 查詢該地址是否為發行者
        const ISSUER_ROLE = await contract.ISSUER_ROLE();
        const hasIssuerRole = await contract.hasRole(ISSUER_ROLE, walletAddress);
        console.log('👤 是否為發行者:', hasIssuerRole ? '是' : '否');
        
        // 查詢該地址是否為管理員
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, walletAddress);
        console.log('👑 是否為管理員:', hasAdminRole ? '是' : '否');
        
        console.log('\n🔍 詳細 Token 信息:');
        
        // 由於沒有 tokenOfOwnerByIndex，我們嘗試查詢一些已知的 Token ID
        const balanceNum = Number(balance.toString());
        if (balanceNum > 0) {
            console.log(`📝 該地址擁有 ${balanceNum} 個 Token`);
            
            // 嘗試查詢一些可能的 Token ID
            const possibleTokenIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            
            for (const tokenId of possibleTokenIds) {
                try {
                    const owner = await contract.ownerOf(tokenId);
                    if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                        console.log(`   ✅ Token ID ${tokenId}: 屬於此地址`);
                        
                        // 查詢 Token 的元數據哈希
                        try {
                            const metaHash = await contract.getMetaHash(tokenId);
                            console.log(`      📄 元數據哈希: ${metaHash}`);
                        } catch (e) {
                            console.log(`      ⚠️  無法獲取元數據哈希`);
                        }
                        
                        // 查詢 Token 是否被撤銷
                        try {
                            const isRevoked = await contract.isRevoked(tokenId);
                            console.log(`      🚫 是否被撤銷: ${isRevoked ? '是' : '否'}`);
                        } catch (e) {
                            console.log(`      ⚠️  無法查詢撤銷狀態`);
                        }
                    }
                } catch (e) {
                    // Token ID 不存在或查詢失敗
                }
            }
        } else {
            console.log('❌ 該地址沒有 Token');
        }
        
        // 驗證合約部署
        console.log('\n🔍 合約驗證:');
        const code = await ethers.provider.getCode(contractAddress);
        console.log('✅ 合約已正確部署');
        console.log('   合約代碼長度:', code.length, '字符');
        
        // 網絡信息
        const network = await ethers.provider.getNetwork();
        const blockNumber = await ethers.provider.getBlockNumber();
        console.log('🌐 網絡信息:');
        console.log('   網絡 ID:', network.chainId.toString());
        console.log('   當前區塊:', blockNumber);
        
    } catch (error) {
        console.error('❌ 查詢失敗:', error.message);
    }
}

main().catch(console.error);
