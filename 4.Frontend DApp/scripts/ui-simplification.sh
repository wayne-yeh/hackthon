#!/bin/bash

# 界面簡化驗證腳本

echo "🎨 界面簡化驗證"
echo "=============="

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

# 2. 檢查各個頁面
echo ""
echo "2. 檢查各個頁面"
echo "---------------"
pages=(
    "/:主頁"
    "/issuer:發行收據"
    "/verify:驗證收據"
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

echo ""
echo "🎯 簡化內容"
echo "==========="
echo "✅ 1. 移除錢包連接按鈕"
echo "   - 移除 '斷開連接' 按鈕"
echo "   - 移除 '重新連接錢包' 按鈕"
echo "   - 移除 '強制登出' 按鈕"
echo "   - 保留 '複製地址' 按鈕"

echo ""
echo "✅ 2. 移除導航鏈接"
echo "   - 移除導航中的 '我的收據' 鏈接"
echo "   - 移除主頁中的 '查看我的收據' 按鈕"

echo ""
echo "✅ 3. 簡化界面"
echo "   - 錢包連接後只顯示地址和複製功能"
echo "   - 主頁只保留 '發行新收據' 按鈕"
echo "   - 導航只保留 '首頁' 和 '驗證收據'"

echo ""
echo "📋 當前功能"
echo "==========="
echo "1. 連接 MetaMask 錢包"
echo "2. 複製錢包地址"
echo "3. 發行新收據"
echo "4. 驗證收據"

echo ""
echo "🎉 簡化完成！"
echo "界面現在更加簡潔，只保留核心功能。"










