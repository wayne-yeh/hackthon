# TAR 系統 curl 測試命令集合

## 🚀 快速測試命令

### 1. 健康檢查

```bash
# Backend Core API
curl -X GET "http://localhost:8083/actuator/health"

# Metadata Service
curl -X GET "http://localhost:8081/actuator/health"

# Verification Service
curl -X GET "http://localhost:8082/actuator/health"
```

### 2. 區塊鏈狀態檢查

```bash
# 檢查區塊鏈連接
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
http://localhost:8545

# 檢查合約代碼
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x5FbDB2315678afecb367f032d93F642f64180aa3", "latest"],"id":1}' \
http://localhost:8545
```

### 3. 發行收據

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.50,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據"
}'
```

### 4. 查詢收據

```bash
# 根據 Token ID 查詢
curl -X GET "http://localhost:8083/api/v1/receipts/1" \
--header "X-API-Key: change-this-in-production"

# 根據所有者地址查詢
curl -X GET "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
--header "X-API-Key: change-this-in-production"
```

### 5. 驗證收據

```bash
curl -X POST "http://localhost:8082/api/v1/verify" \
--header "Content-Type: application/json" \
--header "X-API-Key: change-this-in-production" \
--data '{
    "tokenId": 1,
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}'
```

### 6. 撤銷收據

```bash
curl -X POST "http://localhost:8083/api/v1/receipts/1/revoke" \
--header "X-API-Key: change-this-in-production"
```

---

## 🧪 完整測試流程

### 測試腳本 1: 基本功能測試

```bash
#!/bin/bash
echo "=== TAR 系統基本功能測試 ==="

# 1. 發行收據
echo "1. 發行收據..."
RESPONSE=$(curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-BASIC-TEST",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "基本測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "基本功能測試"
}')

echo $RESPONSE | jq '.'

# 2. 提取 Token ID
TOKEN_ID=$(echo $RESPONSE | jq -r '.tokenId // empty')

if [ ! -z "$TOKEN_ID" ] && [ "$TOKEN_ID" != "null" ]; then
    echo -e "\n2. 查詢收據 (Token ID: $TOKEN_ID)..."
    curl -s -X GET "http://localhost:8083/api/v1/receipts/$TOKEN_ID" \
    --header "X-API-Key: change-this-in-production" | jq '.'

    echo -e "\n3. 驗證收據..."
    curl -s -X POST "http://localhost:8082/api/v1/verify" \
    --header "Content-Type: application/json" \
    --header "X-API-Key: change-this-in-production" \
    --data "{
        \"tokenId\": $TOKEN_ID,
        \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\"
    }" | jq '.'
else
    echo "❌ 發行收據失敗"
fi

echo -e "\n=== 測試完成 ==="
```

### 測試腳本 2: 批量測試

```bash
#!/bin/bash
echo "=== TAR 系統批量測試 ==="

# 發行多個收據
for i in {1..3}; do
    echo "發行收據 $i..."
    curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
    --header 'Content-Type: application/json' \
    --header 'X-API-Key: change-this-in-production' \
    --data "{
        \"invoiceNo\": \"INV-BATCH-$i\",
        \"purchaseDate\": \"2024-01-15\",
        \"amount\": $((1000 + i * 100)).00,
        \"itemName\": \"批量測試商品 $i\",
        \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\",
        \"description\": \"批量測試 $i\"
    }" | jq '.'
    echo ""
done

# 查詢所有收據
echo "查詢所有收據..."
curl -s -X GET "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
--header "X-API-Key: change-this-in-production" | jq '.'

echo -e "\n=== 批量測試完成 ==="
```

### 測試腳本 3: 錯誤處理測試

```bash
#!/bin/bash
echo "=== TAR 系統錯誤處理測試 ==="

# 1. 測試重複發票號
echo "1. 測試重複發票號..."
curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-DUPLICATE-TEST",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "重複測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "第一次發行"
}' | jq '.'

curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-DUPLICATE-TEST",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "重複測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "第二次發行（應該失敗）"
}' | jq '.'

# 2. 測試無效 Token ID
echo -e "\n2. 測試無效 Token ID..."
curl -s -X GET "http://localhost:8083/api/v1/receipts/999999" \
--header "X-API-Key: change-this-in-production" | jq '.'

# 3. 測試無效地址
echo -e "\n3. 測試無效地址..."
curl -s -X GET "http://localhost:8083/api/v1/receipts/owner/invalid-address" \
--header "X-API-Key: change-this-in-production" | jq '.'

echo -e "\n=== 錯誤處理測試完成 ==="
```

---

## 🔧 區塊鏈操作命令

### Hardhat 腳本執行

```bash
# 授予 ISSUER_ROLE 權限
cd "1.Smart Contract Service"
npx hardhat run scripts/grantIssuerRole.js --network localhost

# 測試 mint 函數
npx hardhat run scripts/testBackendMint.js --network localhost

# 測試後端 mint
npx hardhat run scripts/testBackendMint.js --network localhost
```

### 區塊鏈查詢

```bash
# 檢查最新區塊
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", true],"id":1}' \
http://localhost:8545 | jq '.'

# 檢查特定交易
curl -X POST -H "Content-Type: application/json" \
--data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0x交易哈希"],"id":1}' \
http://localhost:8545 | jq '.'
```

---

## 📊 預期結果格式

### 成功發行收據

```json
{
  "tokenId": 1,
  "transactionHash": "0x...",
  "metadataUri": "ipfs://...",
  "metadataHash": "0x...",
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "success": true,
  "message": "Receipt issued successfully"
}
```

### 成功驗證收據

```json
{
  "valid": true,
  "tokenId": 1,
  "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "metadataUri": "ipfs://...",
  "metadataHash": "0x...",
  "message": "Receipt is valid"
}
```

### 錯誤響應

```json
{
  "success": false,
  "message": "錯誤描述"
}
```

---

## 🚀 快速開始

1. **啟動所有服務**:

   ```bash
   # 終端 1: Hardhat
   cd "1.Smart Contract Service" && npx hardhat node

   # 終端 2: Metadata Service
   cd "2.Metadata Service" && ./mvnw spring-boot:run

   # 終端 3: Backend Core API
   cd "3.Backend Core API" && ./mvnw spring-boot:run

   # 終端 4: Verification Service
   cd "4.Verification Service" && ./mvnw spring-boot:run
   ```

2. **運行快速測試**:

   ```bash
   ./test-api.sh
   ```

3. **查看詳細測試指南**:
   ```bash
   cat API_TESTING_GUIDE.md
   ```

---

## 💡 提示

- 所有 API 請求都需要 `X-API-Key: change-this-in-production` 頭部
- 以太坊地址必須是有效的 40 字符十六進制格式
- 金額使用小數點格式
- 日期使用 `YYYY-MM-DD` 格式
- Token ID 從 1 開始遞增



