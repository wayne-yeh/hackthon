#!/bin/bash

echo "🧪 TAR 系統 API 快速測試"
echo "=========================="

# 檢查服務狀態
echo "1. 檢查服務健康狀態..."
echo "Backend Core API:"
curl -s -X GET "http://localhost:8083/actuator/health" | jq '.' 2>/dev/null || echo "❌ Backend Core API 未運行"

echo -e "\nMetadata Service:"
curl -s -X GET "http://localhost:8081/actuator/health" | jq '.' 2>/dev/null || echo "❌ Metadata Service 未運行"

echo -e "\nVerification Service:"
curl -s -X GET "http://localhost:8082/actuator/health" | jq '.' 2>/dev/null || echo "❌ Verification Service 未運行"

# 檢查區塊鏈
echo -e "\n2. 檢查區塊鏈連接..."
BLOCK_NUMBER=$(curl -s -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
http://localhost:8545 | jq -r '.result // empty')

if [ ! -z "$BLOCK_NUMBER" ]; then
    echo "✅ 區塊鏈連接正常，當前區塊: $((16#$BLOCK_NUMBER))"
else
    echo "❌ 區塊鏈連接失敗"
fi

# 發行收據測試
echo -e "\n3. 發行測試收據..."
RESPONSE=$(curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-'$(date +%s)'",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "API 測試收據"
}')

echo "發行結果:"
echo $RESPONSE | jq '.' 2>/dev/null || echo $RESPONSE

# 提取 Token ID
TOKEN_ID=$(echo $RESPONSE | jq -r '.tokenId // empty')

if [ ! -z "$TOKEN_ID" ] && [ "$TOKEN_ID" != "null" ]; then
    echo -e "\n4. 查詢收據 (Token ID: $TOKEN_ID)..."
    curl -s -X GET "http://localhost:8083/api/v1/receipts/$TOKEN_ID" \
    --header "X-API-Key: change-this-in-production" | jq '.' 2>/dev/null || echo "查詢失敗"
    
    echo -e "\n5. 驗證收據..."
    curl -s -X POST "http://localhost:8082/api/v1/verify" \
    --header "Content-Type: application/json" \
    --header "X-API-Key: change-this-in-production" \
    --data "{
        \"tokenId\": $TOKEN_ID,
        \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\"
    }" | jq '.' 2>/dev/null || echo "驗證失敗"
    
    echo -e "\n6. 查詢所有者所有收據..."
    curl -s -X GET "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
    --header "X-API-Key: change-this-in-production" | jq '.' 2>/dev/null || echo "查詢失敗"
else
    echo "❌ 發行收據失敗，跳過後續測試"
fi

echo -e "\n✅ 測試完成！"
echo "=========================="
echo "💡 提示:"
echo "- 如果發行失敗，請檢查區塊鏈是否運行"
echo "- 如果驗證失敗，請檢查 Verification Service 是否運行"
echo "- 查看完整測試指南: API_TESTING_GUIDE.md"




