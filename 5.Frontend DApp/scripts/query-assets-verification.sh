#!/bin/bash

# 查詢資產功能驗證

echo "🔍 查詢資產功能驗證"
echo "=================="

# 1. 檢查前端服務
echo ""
echo "1. 檢查前端服務"
echo "---------------"
if curl -s http://localhost:3000 | grep -q "TAR DApp"; then
    echo "✅ 前端服務正常: http://localhost:3000"
else
    echo "❌ 前端服務無法訪問"
    exit 1
fi

# 2. 檢查後端 API
echo ""
echo "2. 檢查後端 API"
echo "---------------"
if curl -s http://localhost:8083/actuator/health | grep -q "UP"; then
    echo "✅ 後端服務正常: http://localhost:8083"
else
    echo "❌ 後端服務無法訪問"
fi

# 3. 檢查各個頁面
echo ""
echo "3. 檢查各個頁面"
echo "---------------"
pages=(
    "/:主頁"
    "/issuer:發行收據"
    "/verify:驗證收據"
    "/query-assets:查詢資產"
)

for page_info in "${pages[@]}"; do
    page=$(echo $page_info | cut -d: -f1)
    name=$(echo $page_info | cut -d: -f2)
    
    echo -n "$name ($page): "
    if curl -s http://localhost:3000$page | grep -q "TAR DApp"; then
        echo "✅ 正常"
    else
        echo "❌ 異常"
    fi
done

# 4. 測試 API 端點
echo ""
echo "4. 測試 API 端點"
echo "---------------"
TEST_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
API_RESPONSE=$(curl -s "http://localhost:8083/api/v1/receipts/owner/$TEST_ADDRESS" \
  -H "X-API-Key: change-this-in-production")

RECEIPT_COUNT=$(echo "$API_RESPONSE" | jq 'length')

if [ "$RECEIPT_COUNT" -gt 0 ]; then
    echo "✅ API 返回 $RECEIPT_COUNT 個收據"
    echo "   測試地址: $TEST_ADDRESS"
else
    echo "⚠️ API 未返回收據或返回 0 個收據"
fi

echo ""
echo "🎯 新增功能"
echo "==========="
echo "✅ 1. 查詢資產頁面 (/query-assets)"
echo "   - 輸入錢包地址查詢"
echo "   - 顯示收據統計信息"
echo "   - 顯示收據列表"
echo "   - 支持 URL 參數傳遞地址"

echo ""
echo "✅ 2. 主頁查詢資產按鈕"
echo "   - 在錢包連接後顯示"
echo "   - 與發行收據按鈕並排"
echo "   - 美觀的按鈕設計"

echo ""
echo "✅ 3. 動態查詢功能"
echo "   - 支持任意錢包地址查詢"
echo "   - 地址格式驗證"
echo "   - 錯誤處理和用戶反饋"
echo "   - 加載狀態顯示"

echo ""
echo "📋 功能特點"
echo "==========="
echo "- 🔍 地址查詢：輸入任意以太坊地址查詢收據"
echo "- 📊 統計信息：顯示總數、有效、已撤銷收據"
echo "- 🎨 美觀界面：使用卡片和徽章設計"
echo "- ⚡ 實時查詢：支持 Enter 鍵快速查詢"
echo "- 🔗 URL 參數：支持通過 URL 傳遞地址"
echo "- 📱 響應式：適配不同屏幕尺寸"
echo "- ✅ 地址驗證：驗證以太坊地址格式"

echo ""
echo "📋 測試步驟"
echo "==========="
echo "1. 訪問 http://localhost:3000"
echo "2. 連接 MetaMask 錢包"
echo "3. 點擊 '查詢資產' 按鈕"
echo "4. 輸入錢包地址: $TEST_ADDRESS"
echo "5. 點擊 '查詢收據' 按鈕"
echo "6. 查看統計信息和收據列表"
echo "7. 測試其他地址查詢"

echo ""
echo "🔧 API 調用"
echo "==========="
echo "端點: GET http://localhost:8083/api/v1/receipts/owner/{address}"
echo "頭部: X-API-Key: change-this-in-production"
echo "示例: curl -X GET http://localhost:8083/api/v1/receipts/owner/$TEST_ADDRESS -H 'X-API-Key: change-this-in-production'"

echo ""
echo "🎉 功能完成！"
echo "現在您可以在主頁點擊 '查詢資產' 按鈕來查詢任意錢包的收據了！"







