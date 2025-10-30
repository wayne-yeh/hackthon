#!/bin/bash

# TAR DApp - 錢包連接功能測試

echo "🔗 TAR DApp 錢包連接功能測試"
echo "============================="

# 檢查前端服務
echo ""
echo "📱 前端服務檢查"
echo "---------------"
if curl -s http://localhost:3000 | grep -q "連接 MetaMask"; then
    echo "✅ 主頁面正常: http://localhost:3000"
    echo "   🔗 錢包連接按鈕已顯示"
else
    echo "❌ 主頁面無法訪問"
fi

# 檢查錢包連接組件
echo ""
echo "💳 錢包連接組件檢查"
echo "-------------------"
if curl -s http://localhost:3000 | grep -q "連接您的 MetaMask 錢包"; then
    echo "✅ 錢包連接組件正常"
    echo "   📝 連接說明文字已顯示"
else
    echo "❌ 錢包連接組件異常"
fi

# 檢查後端 API 服務
echo ""
echo "🔧 後端 API 服務檢查"
echo "-------------------"
if curl -s http://localhost:8083/actuator/health | grep -q "UP"; then
    echo "✅ Backend Core API 正常 (端口 8083)"
else
    echo "❌ Backend Core API 無法訪問"
fi

# 測試 API 端點
echo ""
echo "🧪 API 端點測試"
echo "---------------"
echo "測試發行收據 API..."
API_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production" \
  -d '{
    "invoiceNo": "TEST-WALLET-001",
    "purchaseDate": "2024-01-01",
    "amount": 100.50,
    "itemName": "Test Item",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "description": "Test item for wallet integration"
  }')

if echo "$API_RESPONSE" | grep -q "tokenId"; then
    echo "✅ 發行收據 API 正常"
    TOKEN_ID=$(echo "$API_RESPONSE" | grep -o '"tokenId":[0-9]*' | cut -d: -f2)
    echo "   生成的 Token ID: $TOKEN_ID"
else
    echo "❌ 發行收據 API 失敗"
    echo "   響應: $API_RESPONSE"
fi

echo ""
echo "🎉 測試完成！"
echo ""
echo "📋 使用說明:"
echo "   1. 訪問 http://localhost:3000"
echo "   2. 點擊 '連接 MetaMask' 按鈕"
echo "   3. 在 MetaMask 中確認連接"
echo "   4. 連接成功後可以："
echo "      - 發行新收據"
echo "      - 查看我的收據"
echo "      - 驗證收據"
echo ""
echo "⚠️  注意事項:"
echo "   - 請確保已安裝 MetaMask 瀏覽器擴展"
echo "   - 需要在瀏覽器中手動測試錢包連接"
echo "   - 所有 API 調用現在都是真實的，不是模擬數據"










