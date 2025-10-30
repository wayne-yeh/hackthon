# MetaMask 圖片顯示問題解決指南

## 問題診斷

MetaMask 顯示空白圖片可能有以下原因：

### 1. MetaMask 無法訪問 localhost metadata URI

**問題**：合約中存儲的 metadata URI 是 `http://localhost:8081/api/metadata/download?key=ipfs://...`

**原因**：MetaMask 運行在瀏覽器中，無法訪問 `localhost` URL（除非在同一個機器上）

**解決方案**：

#### 方案 A: 使用 ngrok（推薦用於開發）

```bash
# 1. 安裝 ngrok
brew install ngrok

# 2. 啟動 ngrok 隧道
ngrok http 8081

# 3. 複製 ngrok 提供的 HTTPS URL（例如：https://abc123.ngrok.io）

# 4. 修改 application.yml
# 將 base-url 改為 ngrok URL
app:
  metadata:
    base-url: https://abc123.ngrok.io

# 5. 重啟 Metadata Service
```

#### 方案 B: 使用公共 IPFS Gateway

修改 `IpfsAdapterStub` 返回公共 IPFS gateway URL：

```java
String url = "https://ipfs.io/ipfs/" + hash;
```

但這需要將 metadata 實際上傳到 IPFS。

#### 方案 C: 部署到公共服務器

將 Metadata Service 部署到公共服務器（如 Heroku、AWS、Vercel 等）。

### 2. 圖片 URL 無法訪問

**問題**：雖然 metadata JSON 包含 `image` 字段，但圖片 URL 可能無法訪問

**測試**：

```bash
# 測試圖片 URL
curl -I "https://picsum.photos/id/237/200/300"
```

如果返回 405 或其他錯誤，使用其他圖片 URL：

```bash
# 方案 1: 使用 placeholder 服務
"imageBase64": "https://via.placeholder.com/200/300.png"

# 方案 2: 使用其他圖片服務
"imageBase64": "https://picsum.photos/200/300"

# 方案 3: 上傳到自己的服務器
"imageBase64": "https://your-domain.com/images/image.jpg"
```

### 3. CORS 問題

已添加 CORS 配置，但需要確認：

1. 已添加 `CorsConfig.java`
2. 重啟 Metadata Service
3. 檢查 CORS 頭部是否正確返回

## 完整測試步驟

### 步驟 1: 使用 ngrok 暴露 localhost

```bash
# 啟動 ngrok
ngrok http 8081

# 記下提供的 HTTPS URL（例如：https://abc123.ngrok.io）
```

### 步驟 2: 更新配置

修改 `2.Metadata Service/src/main/resources/application.yml`：

```yaml
app:
  metadata:
    base-url: https://abc123.ngrok.io # 使用 ngrok URL
```

### 步驟 3: 重啟服務

```bash
# 重啟 Metadata Service
./remove_all_service.sh
./all_service_start.sh
```

### 步驟 4: 發行新收據

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-NGROK-TEST-'$(date +%s)'",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據",
    "imageBase64": "https://via.placeholder.com/200/300.png"
}'
```

### 步驟 5: 驗證

1. 檢查響應中的 `metadataUri` 現在應該是 `https://abc123.ngrok.io/api/metadata/download?key=ipfs://...`
2. 在瀏覽器中訪問這個 URL，應該能看到 JSON
3. 在 MetaMask 中導入 NFT，應該能看到圖片

## 使用不同的圖片 URL

如果 `picsum.photos` 有問題，嘗試這些：

```bash
# 方案 1: placeholder.com
"imageBase64": "https://via.placeholder.com/200/300.png"

# 方案 2: 簡化的 picsum URL
"imageBase64": "https://picsum.photos/200/300"

# 方案 3: 使用隨機圖片
"imageBase64": "https://picsum.photos/seed/picsum/200/300"

# 方案 4: 上傳到圖床（如 imgur）
"imageBase64": "https://i.imgur.com/xxx.jpg"
```

## 快速測試腳本

```bash
#!/bin/bash

# 設置 ngrok URL（如果使用）
NGROK_URL="https://abc123.ngrok.io"  # 替換為你的 ngrok URL

# 發行收據
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
    \"imageBase64\": \"https://via.placeholder.com/200/300.png\"
}")

echo "$RESPONSE" | python3 -m json.tool

TOKEN_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tokenId', 'N/A'))" 2>/dev/null)
METADATA_URI=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('metadataUri', 'N/A'))" 2>/dev/null)

echo ""
echo "Token ID: $TOKEN_ID"
echo "Metadata URI: $METADATA_URI"
echo ""
echo "請確保 MetaMask 可以訪問這個 metadata URI"
echo "如果使用 localhost，請使用 ngrok 或其他工具暴露服務"
```
