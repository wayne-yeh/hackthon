#!/bin/bash

# TAR DApp - 錢包地址測試腳本
# 測試地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

echo "🔧 TAR DApp 錢包地址測試"
echo "======================="
echo "測試錢包地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

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

# 檢查該錢包地址的現有收據
echo ""
echo "📋 檢查現有收據"
echo "---------------"
EXISTING_RECEIPTS=$(curl -s "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
  -H "X-API-Key: change-this-in-production")

if echo "$EXISTING_RECEIPTS" | grep -q "tokenId"; then
    RECEIPT_COUNT=$(echo "$EXISTING_RECEIPTS" | grep -o '"tokenId"' | wc -l)
    echo "✅ 找到 $RECEIPT_COUNT 個現有收據"
    
    # 顯示收據詳情
    echo ""
    echo "📄 收據詳情:"
    echo "$EXISTING_RECEIPTS" | jq -r '.[] | "Token ID: \(.tokenId) | 發票號: \(.invoiceNo) | 物品: \(.itemName) | 金額: \(.amount)"' 2>/dev/null || echo "無法解析收據詳情"
else
    echo "❌ 未找到收據"
fi

# 發行新收據測試
echo ""
echo "📝 發行新收據測試"
echo "----------------"
NEW_RECEIPT_RESPONSE=$(curl -s -X POST "http://localhost:8083/api/v1/receipts/issue" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: change-this-in-production" \
  -d '{
    "invoiceNo": "WALLET-TEST-'$(date +%s)'",
    "purchaseDate": "2025-10-27",
    "amount": 99.99,
    "itemName": "錢包測試收據",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "測試錢包地址收據發行和顯示功能"
  }')

if echo "$NEW_RECEIPT_RESPONSE" | grep -q "success.*true"; then
    NEW_TOKEN_ID=$(echo "$NEW_RECEIPT_RESPONSE" | grep -o '"tokenId":[0-9]*' | grep -o '[0-9]*')
    echo "✅ 新收據發行成功"
    echo "   新 Token ID: $NEW_TOKEN_ID"
else
    echo "❌ 新收據發行失敗"
    echo "   響應: $NEW_RECEIPT_RESPONSE"
fi

# 再次檢查收據數量
echo ""
echo "📋 發行後收據檢查"
echo "----------------"
UPDATED_RECEIPTS=$(curl -s "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
  -H "X-API-Key: change-this-in-production")

if echo "$UPDATED_RECEIPTS" | grep -q "tokenId"; then
    NEW_RECEIPT_COUNT=$(echo "$UPDATED_RECEIPTS" | grep -o '"tokenId"' | wc -l)
    echo "✅ 發行後找到 $NEW_RECEIPT_COUNT 個收據"
    
    if [ "$NEW_RECEIPT_COUNT" -gt "$RECEIPT_COUNT" ]; then
        echo "✅ 收據數量增加，新收據已成功添加"
    else
        echo "⚠️ 收據數量未增加，可能存在問題"
    fi
else
    echo "❌ 發行後未找到收據"
fi

# 檢查前端頁面
echo ""
echo "📱 前端頁面檢查"
echo "---------------"
if curl -s http://localhost:3000/my | grep -q "我的收據"; then
    echo "✅ '我的收據' 頁面正常"
else
    echo "❌ '我的收據' 頁面無法訪問"
fi

if curl -s http://localhost:3000/issuer | grep -q "發行收據"; then
    echo "✅ '發行收據' 頁面正常"
else
    echo "❌ '發行收據' 頁面無法訪問"
fi

echo ""
echo "🎉 錢包地址測試完成！"
echo ""
echo "📋 測試結果總結:"
echo "   - 錢包地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "   - 現有收據: $RECEIPT_COUNT 個"
echo "   - 新收據發行: $([ "$NEW_RECEIPT_COUNT" -gt "$RECEIPT_COUNT" ] && echo "成功" || echo "失敗")"
echo "   - 前端服務: 正常"
echo "   - 後端 API: 正常"
echo ""
echo "💡 下一步測試:"
echo "   1. 在瀏覽器中訪問 http://localhost:3000"
echo "   2. 連接 MetaMask 錢包"
echo "   3. 確保錢包地址是 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "   4. 訪問 '我的收據' 頁面查看收據"
echo "   5. 測試 '發行收據' 功能"
echo "   6. 測試 '斷開連接' 功能"
echo ""
echo "⚠️  注意事項:"
echo "   - 請確保 MetaMask 中選擇的是正確的錢包地址"
echo "   - 如果收據不顯示，請檢查瀏覽器控制台的錯誤信息"
echo "   - 斷開連接功能已改進，但仍可能無法完全清除 MetaMask 的緩存"









