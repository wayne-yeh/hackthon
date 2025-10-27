#!/bin/bash

# TAR DApp - 服務狀態檢查腳本

echo "🔍 TAR DApp 服務狀態檢查"
echo "=========================="

# 檢查前端服務
echo ""
echo "📱 前端服務 (端口 3000)"
echo "----------------------"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服務運行正常"
    echo "   URL: http://localhost:3000"
else
    echo "❌ 前端服務無法訪問"
fi

# 檢查 Backend Core API
echo ""
echo "🔧 Backend Core API (端口 8083)"
echo "-------------------------------"
if curl -s http://localhost:8083/actuator/health | grep -q "UP"; then
    echo "✅ Backend Core API 運行正常"
    echo "   URL: http://localhost:8083"
    echo "   Swagger: http://localhost:8083/swagger-ui.html"
else
    echo "❌ Backend Core API 無法訪問"
fi

# 檢查 Metadata Service
echo ""
echo "📄 Metadata Service (端口 8081)"
echo "-------------------------------"
if curl -s http://localhost:8081/actuator/health | grep -q "UP"; then
    echo "✅ Metadata Service 運行正常"
    echo "   URL: http://localhost:8081"
    echo "   Swagger: http://localhost:8081/swagger-ui.html"
else
    echo "❌ Metadata Service 無法訪問"
fi

# 檢查 Verification Service
echo ""
echo "🔍 Verification Service (端口 8082)"
echo "----------------------------------"
if curl -s http://localhost:8082/actuator/health | grep -q "UP"; then
    echo "✅ Verification Service 運行正常"
    echo "   URL: http://localhost:8082"
    echo "   Swagger: http://localhost:8082/swagger-ui.html"
else
    echo "❌ Verification Service 無法訪問"
fi

# 測試 API 連接
echo ""
echo "🧪 API 連接測試"
echo "---------------"
echo "測試收據驗證 API..."
API_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/receipts/verify \
  -H "Content-Type: application/json" \
  -d '{"tokenId": 999999, "metadataHash": "test-hash"}')

if echo "$API_RESPONSE" | grep -q "valid"; then
    echo "✅ API 連接正常"
    echo "   響應: $API_RESPONSE"
else
    echo "❌ API 連接失敗"
fi

echo ""
echo "🎉 檢查完成！"
echo ""
echo "📋 訪問地址:"
echo "   前端應用: http://localhost:3000"
echo "   Backend API: http://localhost:8083/swagger-ui.html"
echo "   Metadata API: http://localhost:8081/swagger-ui.html"
echo "   Verification API: http://localhost:8082/swagger-ui.html"
