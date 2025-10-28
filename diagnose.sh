#!/bin/bash

echo "🔍 診斷 TAR 系統問題"
echo "===================="

# 1. 檢查服務狀態
echo "1. 檢查服務狀態..."
echo "Backend Core API:"
curl -s -X GET "http://localhost:8083/actuator/health" | jq '.' 2>/dev/null || echo "❌ Backend Core API 未運行"

echo -e "\nHardhat 區塊鏈:"
BLOCK_NUMBER=$(curl -s -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
http://localhost:8545 | jq -r '.result // empty')

if [ ! -z "$BLOCK_NUMBER" ]; then
    echo "✅ 區塊鏈連接正常，當前區塊: $((16#$BLOCK_NUMBER))"
else
    echo "❌ 區塊鏈連接失敗"
fi

# 2. 檢查後端地址餘額
echo -e "\n2. 檢查後端地址餘額..."
BACKEND_ADDRESS="0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
BALANCE=$(curl -s -X POST -H "Content-Type: application/json" \
--data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$BACKEND_ADDRESS\", \"latest\"],\"id\":1}" \
http://localhost:8545 | jq -r '.result // empty')

if [ ! -z "$BALANCE" ]; then
    BALANCE_DECIMAL=$((16#$BALANCE))
    echo "✅ 後端地址餘額: $BALANCE_DECIMAL wei (約 $((BALANCE_DECIMAL / 1000000000000000000)) ETH)"
else
    echo "❌ 無法獲取餘額"
fi

# 3. 檢查合約地址
echo -e "\n3. 檢查合約地址..."
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
CONTRACT_CODE=$(curl -s -X POST -H "Content-Type: application/json" \
--data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CONTRACT_ADDRESS\", \"latest\"],\"id\":1}" \
http://localhost:8545 | jq -r '.result // empty')

if [ ! -z "$CONTRACT_CODE" ] && [ "$CONTRACT_CODE" != "0x" ]; then
    echo "✅ 合約已部署: $CONTRACT_ADDRESS"
else
    echo "❌ 合約未部署或地址錯誤"
fi

# 4. 檢查後端地址是否有 ISSUER_ROLE
echo -e "\n4. 檢查後端地址權限..."
ISSUER_ROLE=$(curl -s -X POST -H "Content-Type: application/json" \
--data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$CONTRACT_ADDRESS\",\"data\":\"0x91d1485500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8\"}, \"latest\"],\"id\":1}" \
http://localhost:8545 | jq -r '.result // empty')

if [ ! -z "$ISSUER_ROLE" ]; then
    if [ "$ISSUER_ROLE" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
        echo "✅ 後端地址有 ISSUER_ROLE 權限"
    else
        echo "❌ 後端地址沒有 ISSUER_ROLE 權限"
    fi
else
    echo "❌ 無法檢查權限"
fi

# 5. 測試直接發送交易
echo -e "\n5. 測試直接發送交易..."
echo "發送一個簡單的轉帳交易..."

# 獲取 nonce
NONCE=$(curl -s -X POST -H "Content-Type: application/json" \
--data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionCount\",\"params\":[\"$BACKEND_ADDRESS\", \"latest\"],\"id\":1}" \
http://localhost:8545 | jq -r '.result // empty')

if [ ! -z "$NONCE" ]; then
    echo "✅ 獲取 nonce 成功: $NONCE"
else
    echo "❌ 無法獲取 nonce"
fi

echo -e "\n6. 問題分析..."
echo "===================="
echo "根據以上檢查結果："
echo "- 如果所有檢查都通過，問題可能在於 web3j 的交易發送邏輯"
echo "- 如果權限檢查失敗，需要重新授予 ISSUER_ROLE"
echo "- 如果合約未部署，需要重新部署合約"
echo "- 如果餘額不足，需要轉帳 ETH"

echo -e "\n💡 建議解決方案："
echo "1. 重啟後端服務"
echo "2. 檢查後端日誌中的詳細錯誤信息"
echo "3. 使用 Hardhat 腳本直接測試 mint 功能"
echo "4. 檢查 web3j 版本兼容性"


