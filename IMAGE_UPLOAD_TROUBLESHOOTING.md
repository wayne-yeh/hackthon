# 測試圖片上傳和 MetaMask 顯示指南

## 問題診斷

根據測試結果，問題可能出在：

1. **Metadata Service 需要重啟**才能應用更改
2. **圖片 URL 必須是公開可訪問的**（MetaMask 需要能訪問）
3. **Metadata JSON 必須包含正確的 `image` 字段**

## 解決步驟

### 步驟 1: 重啟所有服務

```bash
# 停止所有服務
./remove_all_service.sh

# 重新啟動所有服務
./all_service_start.sh
```

### 步驟 2: 發行帶圖片 URL 的收據

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-FINAL",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據",
    "imageBase64": "https://picsum.photos/id/237/200/300"
}'
```

### 步驟 3: 驗證 Metadata JSON

從響應中獲取 `metadataUri`，然後訪問：

```bash
# 假設 metadataUri = "ipfs://xxx"
curl "http://localhost:8081/api/metadata/download?key=ipfs://xxx" | python3 -m json.tool
```

應該看到：

```json
{
    "name": "TAR Receipt #INV-TEST-FINAL",
    "description": "Tokenized Asset Receipt - 測試商品 (Amount: 1000.5 TWD, Date: 2024-01-15)",
    "image": "https://picsum.photos/id/237/200/300",
    "imageUrl": "https://picsum.photos/id/237/200/300",
    ...
}
```

### 步驟 4: 在 MetaMask 中查看

1. 打開 MetaMask
2. 導入 NFT：
   - 合約地址：從 `1.Smart Contract Service/deploy/addresses.json` 獲取
   - Token ID：從發行響應中獲取 `tokenId`
3. 應該能看到圖片

## 如果圖片仍然不顯示

### 檢查點 1: 圖片 URL 是否可訪問

```bash
# 測試圖片 URL
curl -I "https://picsum.photos/id/237/200/300"
```

應該返回 `200 OK`。

### 檢查點 2: Metadata JSON 格式

確保 metadata JSON 包含：

- `name` 字段（ERC721 標準）
- `description` 字段（ERC721 標準）
- `image` 字段（ERC721 標準，必須是完整的 URL）

### 檢查點 3: IPFS Gateway

如果使用 IPFS，確保 MetaMask 可以訪問 IPFS gateway。可以：

1. 使用公共 IPFS gateway（如 `ipfs.io`）
2. 或者使用自己的 IPFS 節點

## 推薦的圖片 URL 格式

使用以下類型的圖片 URL 更容易在 MetaMask 中顯示：

1. **HTTPS URL**（推薦）

   ```
   https://picsum.photos/id/237/200/300
   ```

2. **公共 IPFS Gateway**

   ```
   https://ipfs.io/ipfs/QmXXX...
   ```

3. **自己的服務器**
   ```
   https://your-domain.com/images/image.jpg
   ```

避免使用：

- `http://` URL（不安全，某些瀏覽器可能阻止）
- 本地 URL（`localhost`、`127.0.0.1`）
- 需要認證的 URL

## 測試腳本

創建一個完整的測試腳本：

```bash
#!/bin/bash

echo "=== 發行帶圖片的收據 ==="
RESPONSE=$(curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data "{
    \"invoiceNo\": \"INV-TEST-$(date +%s)\",
    \"purchaseDate\": \"2024-01-15\",
    \"amount\": 1000.5,
    \"itemName\": \"測試商品\",
    \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\",
    \"description\": \"這是一個測試收據\",
    \"imageBase64\": \"https://picsum.photos/id/237/200/300\"
}")

echo "$RESPONSE" | python3 -m json.tool

TOKEN_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tokenId', 'N/A'))" 2>/dev/null)
METADATA_URI=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('metadataUri', 'N/A'))" 2>/dev/null)

echo ""
echo "Token ID: $TOKEN_ID"
echo "Metadata URI: $METADATA_URI"
echo ""

if [ "$METADATA_URI" != "N/A" ]; then
    echo "=== 獲取 Metadata JSON ==="
    curl -s "http://localhost:8081/api/metadata/download?key=$METADATA_URI" | python3 -m json.tool | grep -E "name|description|image|imageUrl"
fi
```
