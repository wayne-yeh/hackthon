#!/bin/bash

# TAR 系統配置檢查腳本
# 使用方法: ./check-config.sh

echo "🔍 TAR 系統配置檢查"
echo "===================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查配置文件
check_config_file() {
    local file_path=$1
    local service_name=$2
    
    echo -e "${BLUE}檢查 $service_name 配置...${NC}"
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅ 配置文件存在: $file_path${NC}"
        
        # 檢查關鍵配置
        if [ "$service_name" = "Backend Core API" ]; then
            # 檢查區塊鏈配置
            if grep -q "rpc-url: http://localhost:8545" "$file_path"; then
                echo -e "${GREEN}✅ RPC URL 配置正確${NC}"
            else
                echo -e "${RED}❌ RPC URL 配置錯誤${NC}"
            fi
            
            if grep -q 'contract-address: "0x' "$file_path"; then
                CONTRACT_ADDR=$(grep 'contract-address:' "$file_path" | sed 's/.*"\(0x[^"]*\)".*/\1/')
                echo -e "${GREEN}✅ 合約地址配置: $CONTRACT_ADDR${NC}"
            else
                echo -e "${RED}❌ 合約地址配置錯誤${NC}"
            fi
            
            if grep -q "issuer-private-key: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" "$file_path"; then
                echo -e "${GREEN}✅ 私鑰配置正確${NC}"
            else
                echo -e "${RED}❌ 私鑰配置錯誤${NC}"
            fi
        fi
        
        return 0
    else
        echo -e "${RED}❌ 配置文件不存在: $file_path${NC}"
        return 1
    fi
}

# 檢查服務狀態
check_service_status() {
    local service_name=$1
    local port=$2
    local health_url=$3
    
    echo -e "${BLUE}檢查 $service_name 服務狀態...${NC}"
    
    if curl -s "$health_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name 運行正常 (端口 $port)${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name 未運行 (端口 $port)${NC}"
        return 1
    fi
}

# 檢查區塊鏈連接
check_blockchain() {
    echo -e "${BLUE}檢查區塊鏈連接...${NC}"
    
    BLOCK_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8545)
    
    if echo "$BLOCK_RESPONSE" | grep -q '"result"'; then
        BLOCK_NUMBER=$(echo "$BLOCK_RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
        BLOCK_DECIMAL=$((16#$BLOCK_NUMBER))
        echo -e "${GREEN}✅ 區塊鏈連接正常${NC}"
        echo -e "${GREEN}   當前區塊號: $BLOCK_DECIMAL (0x$BLOCK_NUMBER)${NC}"
        return 0
    else
        echo -e "${RED}❌ 區塊鏈連接失敗${NC}"
        return 1
    fi
}

# 檢查合約部署
check_contract_deployment() {
    echo -e "${BLUE}檢查合約部署...${NC}"
    
    # 從配置文件讀取合約地址
    CONFIG_FILE="/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API/src/main/resources/application.yml"
    
    if [ -f "$CONFIG_FILE" ]; then
        CONTRACT_ADDR=$(grep 'contract-address:' "$CONFIG_FILE" | sed 's/.*"\(0x[^"]*\)".*/\1/')
        
        if [ -n "$CONTRACT_ADDR" ]; then
            echo "檢查合約地址: $CONTRACT_ADDR"
            
            # 檢查合約代碼
            CODE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
                --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CONTRACT_ADDR\",\"latest\"],\"id\":1}" \
                http://localhost:8545)
            
            if echo "$CODE_RESPONSE" | grep -q '"result":"0x' && ! echo "$CODE_RESPONSE" | grep -q '"result":"0x"'; then
                echo -e "${GREEN}✅ 合約已部署${NC}"
                return 0
            else
                echo -e "${RED}❌ 合約未部署或地址錯誤${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ 無法讀取合約地址${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ 配置文件不存在${NC}"
        return 1
    fi
}

# 主函數
main() {
    echo "開始配置檢查..."
    echo ""
    
    # 檢查配置文件
    check_config_file "/Users/weiyeh/Desktop/區塊鏈/hackathon/2.Metadata Service/src/main/resources/application.yml" "Metadata Service"
    echo ""
    
    check_config_file "/Users/weiyeh/Desktop/區塊鏈/hackathon/3.Backend Core API/src/main/resources/application.yml" "Backend Core API"
    echo ""
    
    check_config_file "/Users/weiyeh/Desktop/區塊鏈/hackathon/4.Verification Service/src/main/resources/application.yml" "Verification Service"
    echo ""
    
    # 檢查服務狀態
    check_service_status "Hardhat" "8545" "http://localhost:8545"
    check_service_status "Metadata Service" "8081" "http://localhost:8081/actuator/health"
    check_service_status "Backend Core API" "8083" "http://localhost:8083/actuator/health"
    check_service_status "Verification Service" "8082" "http://localhost:8082/actuator/health"
    echo ""
    
    # 檢查區塊鏈
    check_blockchain
    echo ""
    
    # 檢查合約部署
    check_contract_deployment
    echo ""
    
    echo -e "${BLUE}配置檢查完成！${NC}"
    echo ""
    echo -e "${YELLOW}如果發現問題，請：${NC}"
    echo "1. 檢查服務是否正確啟動"
    echo "2. 確認配置文件中的地址和端口"
    echo "3. 重新部署合約並更新配置"
    echo "4. 運行 ./quick-start.sh 重新啟動系統"
}

# 運行主函數
main "$@"

