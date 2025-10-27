#!/bin/bash

# TAR 系統快速啟動腳本
# 使用方法: ./quick-start.sh

echo "🚀 TAR 系統快速啟動腳本"
echo "================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查函數
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    echo -e "${BLUE}檢查 $service_name 服務...${NC}"
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name 運行正常 (端口 $port)${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name 未運行 (端口 $port)${NC}"
        return 1
    fi
}

# 清理端口函數
cleanup_ports() {
    echo -e "${YELLOW}🧹 清理佔用的端口...${NC}"
    
    for port in 8081 8082 8083 8545; do
        if lsof -ti:$port > /dev/null 2>&1; then
            echo "停止端口 $port 上的進程..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 2
    echo -e "${GREEN}✅ 端口清理完成${NC}"
}

# 啟動 Hardhat
start_hardhat() {
    echo -e "${BLUE}🔗 啟動 Hardhat 區塊鏈...${NC}"
    
    cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
    
    # 檢查是否已經運行
    if check_service "Hardhat" "8545" "http://localhost:8545"; then
        echo -e "${GREEN}Hardhat 已經運行${NC}"
        return 0
    fi
    
    echo "啟動 Hardhat 節點..."
    npm run node &
    HARDHAT_PID=$!
    
    # 等待 Hardhat 啟動
    echo "等待 Hardhat 啟動..."
    for i in {1..30}; do
        if curl -s -X POST -H "Content-Type: application/json" \
           --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
           http://localhost:8545 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Hardhat 啟動成功${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Hardhat 啟動失敗${NC}"
    return 1
}

# 部署合約
deploy_contract() {
    echo -e "${BLUE}📝 部署智能合約...${NC}"
    
    cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
    
    # 部署合約
    CONTRACT_OUTPUT=$(npx hardhat run scripts/deploy.ts --network localhost 2>&1)
    CONTRACT_ADDRESS=$(echo "$CONTRACT_OUTPUT" | grep -o '0x[a-fA-F0-9]\{40\}' | tail -1)
    
    if [ -n "$CONTRACT_ADDRESS" ]; then
        echo -e "${GREEN}✅ 合約部署成功: $CONTRACT_ADDRESS${NC}"
        
        # 更新配置文件
        echo -e "${YELLOW}📝 更新 Backend Core API 配置...${NC}"
        sed -i '' "s/contract-address: \".*\"/contract-address: \"$CONTRACT_ADDRESS\"/" \
            "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API/src/main/resources/application.yml"
        
        echo -e "${GREEN}✅ 配置更新完成${NC}"
        return 0
    else
        echo -e "${RED}❌ 合約部署失敗${NC}"
        echo "$CONTRACT_OUTPUT"
        return 1
    fi
}

# 授予權限
grant_permissions() {
    echo -e "${BLUE}🔑 授予後端地址 ISSUER_ROLE 權限...${NC}"
    
    cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/1.Smart Contract Service"
    
    npx hardhat run scripts/grantAndTestMint.js --network localhost
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 權限授予成功${NC}"
        return 0
    else
        echo -e "${RED}❌ 權限授予失敗${NC}"
        return 1
    fi
}

# 啟動 Metadata Service
start_metadata_service() {
    echo -e "${BLUE}📊 啟動 Metadata Service...${NC}"
    
    if check_service "Metadata Service" "8081" "http://localhost:8081/actuator/health"; then
        echo -e "${GREEN}Metadata Service 已經運行${NC}"
        return 0
    fi
    
    cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/2.Metadata Service"
    ./mvnw spring-boot:run &
    METADATA_PID=$!
    
    # 等待服務啟動
    echo "等待 Metadata Service 啟動..."
    for i in {1..60}; do
        if check_service "Metadata Service" "8081" "http://localhost:8081/actuator/health"; then
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Metadata Service 啟動失敗${NC}"
    return 1
}

# 啟動 Backend Core API
start_backend_api() {
    echo -e "${BLUE}🔧 啟動 Backend Core API...${NC}"
    
    if check_service "Backend Core API" "8083" "http://localhost:8083/actuator/health"; then
        echo -e "${GREEN}Backend Core API 已經運行${NC}"
        return 0
    fi
    
    cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API"
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    
    # 等待服務啟動
    echo "等待 Backend Core API 啟動..."
    for i in {1..60}; do
        if check_service "Backend Core API" "8083" "http://localhost:8083/actuator/health"; then
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Backend Core API 啟動失敗${NC}"
    return 1
}

# 啟動 Verification Service
start_verification_service() {
    echo -e "${BLUE}🔍 啟動 Verification Service...${NC}"
    
    if check_service "Verification Service" "8082" "http://localhost:8082/actuator/health"; then
        echo -e "${GREEN}Verification Service 已經運行${NC}"
        return 0
    fi
    
    cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/4.Verification Service"
    ./mvnw spring-boot:run &
    VERIFICATION_PID=$!
    
    # 等待服務啟動
    echo "等待 Verification Service 啟動..."
    for i in {1..60}; do
        if check_service "Verification Service" "8082" "http://localhost:8082/actuator/health"; then
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Verification Service 啟動失敗${NC}"
    return 1
}

# 測試 API
test_api() {
    echo -e "${BLUE}🧪 測試 API 功能...${NC}"
    
    # 獲取當前區塊號
    CURRENT_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8545 | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    
    echo "當前區塊號: $CURRENT_BLOCK"
    
    # 測試 API
    echo "發送測試請求..."
    RESPONSE=$(curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
        --header 'Content-Type: application/json' \
        --header 'X-API-Key: change-this-in-production' \
        --data '{
            "invoiceNo": "INV-AUTO-TEST-'$(date +%s)'",
            "purchaseDate": "2024-01-15",
            "amount": 999.99,
            "itemName": "自動測試商品",
            "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "description": "自動測試收據"
        }' --max-time 35)
    
    # 檢查響應
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ API 測試成功！${NC}"
        echo "響應: $RESPONSE"
        
        # 檢查區塊號是否增加
        NEW_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            http://localhost:8545 | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
        
        echo "新區塊號: $NEW_BLOCK"
        
        if [ "$NEW_BLOCK" != "$CURRENT_BLOCK" ]; then
            echo -e "${GREEN}✅ 區塊鏈交易確認！區塊號已增加${NC}"
        else
            echo -e "${YELLOW}⚠️ 區塊號未變化，但 API 響應成功${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ API 測試失敗${NC}"
        echo "響應: $RESPONSE"
        return 1
    fi
}

# 主函數
main() {
    echo -e "${BLUE}開始啟動 TAR 系統...${NC}"
    
    # 清理端口
    cleanup_ports
    
    # 啟動服務
    if ! start_hardhat; then
        echo -e "${RED}❌ Hardhat 啟動失敗，退出${NC}"
        exit 1
    fi
    
    if ! deploy_contract; then
        echo -e "${RED}❌ 合約部署失敗，退出${NC}"
        exit 1
    fi
    
    if ! grant_permissions; then
        echo -e "${RED}❌ 權限授予失敗，退出${NC}"
        exit 1
    fi
    
    if ! start_metadata_service; then
        echo -e "${RED}❌ Metadata Service 啟動失敗，退出${NC}"
        exit 1
    fi
    
    if ! start_backend_api; then
        echo -e "${RED}❌ Backend Core API 啟動失敗，退出${NC}"
        exit 1
    fi
    
    if ! start_verification_service; then
        echo -e "${RED}❌ Verification Service 啟動失敗，退出${NC}"
        exit 1
    fi
    
    # 等待所有服務穩定
    echo -e "${YELLOW}⏳ 等待所有服務穩定...${NC}"
    sleep 5
    
    # 測試 API
    if test_api; then
        echo ""
        echo -e "${GREEN}🎉 TAR 系統啟動成功！${NC}"
        echo -e "${GREEN}✅ 所有服務運行正常${NC}"
        echo -e "${GREEN}✅ API 測試通過${NC}"
        echo -e "${GREEN}✅ 區塊鏈交互正常${NC}"
        echo ""
        echo -e "${BLUE}📋 服務狀態：${NC}"
        echo "  - Hardhat: http://localhost:8545"
        echo "  - Metadata Service: http://localhost:8081"
        echo "  - Verification Service: http://localhost:8082"
        echo "  - Backend Core API: http://localhost:8083"
        echo ""
        echo -e "${BLUE}🧪 測試 API：${NC}"
        echo "  curl --location 'http://localhost:8083/api/v1/receipts/issue' \\"
        echo "    --header 'Content-Type: application/json' \\"
        echo "    --header 'X-API-Key: change-this-in-production' \\"
        echo "    --data '{\"invoiceNo\":\"INV-TEST\",\"purchaseDate\":\"2024-01-15\",\"amount\":1000,\"itemName\":\"測試商品\",\"ownerAddress\":\"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\"}'"
    else
        echo -e "${RED}❌ API 測試失敗${NC}"
        exit 1
    fi
}

# 運行主函數
main "$@"
