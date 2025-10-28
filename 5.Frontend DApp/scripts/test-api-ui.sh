#!/bin/bash

# TAR DApp - API 測試工具驗證腳本

echo "🔍 TAR DApp API 測試工具驗證"
echo "=============================="

# 檢查前端服務
echo ""
echo "📱 前端服務檢查"
echo "---------------"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 主頁面正常: http://localhost:3000"
else
    echo "❌ 主頁面無法訪問"
fi

if curl -s http://localhost:3000/api-test > /dev/null; then
    echo "✅ API 測試頁面正常: http://localhost:3000/api-test"
else
    echo "❌ API 測試頁面無法訪問"
fi

# 檢查所有後端服務
echo ""
echo "🔧 後端服務檢查"
echo "---------------"

services=(
    "Backend Core API:8083"
    "Metadata Service:8081"
    "Verification Service:8082"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$port/actuator/health | grep -q "UP"; then
        echo "✅ $name (端口 $port) 運行正常"
    else
        echo "❌ $name (端口 $port) 無法訪問"
    fi
done

# 測試關鍵 API
echo ""
echo "🧪 關鍵 API 測試"
echo "---------------"

# 測試發行收據 API
echo "測試發行收據 API..."
ISSUE_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/receipts/issue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production" \
  -d '{
    "invoiceNo": "TEST-UI-001",
    "purchaseDate": "2024-01-01",
    "amount": 100.50,
    "itemName": "Test Gold Bar",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "description": "Test item for UI validation"
  }')

if echo "$ISSUE_RESPONSE" | grep -q "tokenId"; then
    echo "✅ 發行收據 API 正常"
    TOKEN_ID=$(echo "$ISSUE_RESPONSE" | grep -o '"tokenId":[0-9]*' | cut -d: -f2)
    echo "   生成的 Token ID: $TOKEN_ID"
    
    # 測試驗證 API
    echo "測試驗證收據 API..."
    VERIFY_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/receipts/verify \
      -H "Content-Type: application/json" \
      -d "{\"tokenId\": $TOKEN_ID, \"metadataHash\": \"test-hash\"}")
    
    if echo "$VERIFY_RESPONSE" | grep -q "valid"; then
        echo "✅ 驗證收據 API 正常"
    else
        echo "❌ 驗證收據 API 失敗"
    fi
else
    echo "❌ 發行收據 API 失敗"
fi

echo ""
echo "🎉 驗證完成！"
echo ""
echo "📋 訪問地址:"
echo "   主頁面: http://localhost:3000"
echo "   API 測試工具: http://localhost:3000/api-test"
echo ""
echo "💡 使用說明:"
echo "   1. 訪問 http://localhost:3000/api-test"
echo "   2. 點擊任意 'Test' 按鈕測試 API"
echo "   3. 查看響應結果和狀態碼"
echo "   4. 使用複製按鈕複製 URL 或響應數據"








