#!/bin/bash

# TAR DApp - API 調用測試

echo "🔧 TAR DApp API 調用測試"
echo "======================="

# 檢查環境變量
echo ""
echo "📋 環境變量檢查"
echo "---------------"
echo "NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-未設置}"
echo "NEXT_PUBLIC_API_KEY: ${NEXT_PUBLIC_API_KEY:-未設置}"

# 檢查後端 API 服務
echo ""
echo "🔧 後端 API 服務檢查"
echo "-------------------"
if curl -s http://localhost:8083/actuator/health | grep -q "UP"; then
    echo "✅ Backend Core API 正常 (端口 8083)"
else
    echo "❌ Backend Core API 無法訪問"
    exit 1
fi

# 測試發行收據 API
echo ""
echo "📝 發行收據 API 測試"
echo "------------------"
ISSUE_RESPONSE=$(curl -s -X POST "http://localhost:8083/api/v1/receipts/issue" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production" \
  -d '{
    "invoiceNo": "TEST-FRONTEND-'$(date +%s)'",
    "purchaseDate": "2024-01-01",
    "amount": 100.50,
    "itemName": "Frontend Test Item",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "description": "Test receipt from frontend test script"
  }')

if echo "$ISSUE_RESPONSE" | grep -q "success.*true"; then
    TOKEN_ID=$(echo "$ISSUE_RESPONSE" | grep -o '"tokenId":[0-9]*' | grep -o '[0-9]*')
    echo "✅ 發行收據 API 正常"
    echo "   生成的 Token ID: $TOKEN_ID"
else
    echo "❌ 發行收據 API 失敗"
    echo "   響應: $ISSUE_RESPONSE"
    exit 1
fi

# 測試獲取擁有者收據 API
echo ""
echo "📋 獲取擁有者收據 API 測試"
echo "-------------------------"
OWNER_RESPONSE=$(curl -s "http://localhost:8083/api/v1/receipts/owner/0x1234567890123456789012345678901234567890" \
  -H "X-API-Key: change-this-in-production")

if echo "$OWNER_RESPONSE" | grep -q "tokenId"; then
    RECEIPT_COUNT=$(echo "$OWNER_RESPONSE" | grep -o '"tokenId"' | wc -l)
    echo "✅ 獲取擁有者收據 API 正常"
    echo "   找到 $RECEIPT_COUNT 個收據"
else
    echo "❌ 獲取擁有者收據 API 失敗"
    echo "   響應: $OWNER_RESPONSE"
    exit 1
fi

# 檢查前端服務
echo ""
echo "📱 前端服務檢查"
echo "---------------"
if curl -s http://localhost:3000 | grep -q "TAR DApp"; then
    echo "✅ 前端服務正常: http://localhost:3000"
else
    echo "❌ 前端服務無法訪問"
    exit 1
fi

echo ""
echo "🎉 API 測試完成！"
echo ""
echo "📋 問題診斷:"
echo "   - 後端 API 正常工作"
echo "   - 發行收據功能正常"
echo "   - 獲取收據功能正常"
echo "   - 前端服務正常運行"
echo ""
echo "🔧 可能的問題:"
echo "   1. 前端環境變量未正確設置"
echo "   2. 錢包地址與測試地址不匹配"
echo "   3. 前端 API 調用時缺少 API Key"
echo ""
echo "💡 建議:"
echo "   1. 檢查瀏覽器控制台的錯誤信息"
echo "   2. 確認錢包連接的地址"
echo "   3. 檢查網絡請求中的 Headers"









