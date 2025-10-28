#!/bin/bash

# TAR DApp - 美觀 UI 驗證腳本

echo "🎨 TAR DApp 美觀 UI 驗證"
echo "========================"

# 檢查前端服務
echo ""
echo "📱 前端服務檢查"
echo "---------------"
if curl -s http://localhost:3000 | grep -q "TAR DApp"; then
    echo "✅ 主頁面正常: http://localhost:3000"
    echo "   🎨 美觀的 Landing 頁面已加載"
else
    echo "❌ 主頁面無法訪問"
fi

# 檢查各個頁面
pages=(
    "issuer:發行收據頁面"
    "verify:驗證收據頁面"
    "my:我的收據頁面"
)

echo ""
echo "📄 頁面功能檢查"
echo "---------------"
for page_info in "${pages[@]}"; do
    page=$(echo $page_info | cut -d: -f1)
    name=$(echo $page_info | cut -d: -f2)
    
    if curl -s http://localhost:3000/$page | grep -q "TAR DApp"; then
        echo "✅ $name: http://localhost:3000/$page"
    else
        echo "❌ $name 無法訪問"
    fi
done

# 檢查後端服務
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

echo ""
echo "🎉 驗證完成！"
echo ""
echo "📋 訪問地址:"
echo "   🏠 主頁面: http://localhost:3000"
echo "   📝 發行收據: http://localhost:3000/issuer"
echo "   🔍 驗證收據: http://localhost:3000/verify"
echo "   📋 我的收據: http://localhost:3000/my"
echo ""
echo "✨ 新功能特色:"
echo "   🎨 美觀的漸變背景和現代化設計"
echo "   💳 完整的錢包連接功能"
echo "   📱 響應式設計，支持移動設備"
echo "   🔔 Toast 通知系統"
echo "   🎯 直觀的用戶界面"
echo "   📊 統計數據展示"
echo "   🔍 收據驗證和狀態顯示"
echo "   📤 圖片上傳和預覽功能"









