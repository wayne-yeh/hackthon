# MetaMask 圖片顯示問題 - 完整解決方案

## 問題診斷

根據測試結果，有兩個問題：

### 問題 1: 圖片 URL 無法訪問 ❌

**錯誤的 URL**：`https://picsum.photos/id/237/200/300`

- 返回 405 錯誤
- 無法下載圖片

**正確的 URL**：`https://picsum.photos/200/300`

- 可以正常訪問
- 返回實際的圖片文件

### 問題 2: MetaMask 無法訪問 localhost ✅

**Metadata URI**：`http://localhost:8081/api/metadata/download?key=ipfs://...`

- 瀏覽器可以訪問 ✅
- MetaMask 可能無法訪問 ❌（瀏覽器擴展程序限制）

## 解決方案

### 步驟 1: 使用正確的圖片 URL

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-FIX-'$(date +%s)'",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據",
    "imageBase64": "https://picsum.photos/200/300"
}'
```

**注意**：使用 `https://picsum.photos/200/300` 而不是 `https://picsum.photos/id/237/200/300`

### 步驟 2: 處理 localhost 問題

#### 選項 A: 使用 127.0.0.1（簡單測試）

修改 `application.yml`：

```yaml
app:
  metadata:
    base-url: http://127.0.0.1:8081
```

然後重啟服務。

#### 選項 B: 使用 ngrok（如果選項 A 不行）

```bash
# 1. 安裝 ngrok
brew install ngrok

# 2. 啟動隧道
ngrok http 8081

# 3. 複製 HTTPS URL（例如：https://abc123.ngrok.io）

# 4. 修改 application.yml
app:
  metadata:
    base-url: https://abc123.ngrok.io

# 5. 重啟服務
```

## 測試步驟

### 1. 先修復圖片 URL

```bash
# 使用正確的圖片 URL 發行收據
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-FIX-'$(date +%s)'",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據",
    "imageBase64": "https://picsum.photos/200/300"
}'
```

### 2. 檢查 MetaMask 的 Network 請求

1. 打開 Chrome DevTools（F12）
2. 切換到 Network 標籤
3. 在 MetaMask 中導入 NFT
4. 查看：
   - 是否有對 `localhost:8081` 的請求？
   - 如果沒有，MetaMask 無法訪問 localhost
   - 如果有但失敗了，查看錯誤信息

### 3. 如果 MetaMask 無法訪問 localhost

嘗試使用 `127.0.0.1`：

```yaml
app:
  metadata:
    base-url: http://127.0.0.1:8081
```

如果還是不行，使用 ngrok。

## 推薦的圖片 URL

以下圖片 URL 都可以正常工作：

```bash
# 1. picsum.photos（簡化版）
"imageBase64": "https://picsum.photos/200/300"

# 2. via.placeholder.com（最可靠）
"imageBase64": "https://via.placeholder.com/200/300.png"

# 3. 自己上傳的圖片
"imageBase64": "https://your-domain.com/images/image.jpg"
```

**避免使用**：

- `https://picsum.photos/id/237/200/300` ❌（返回 405）
- `http://` URL（不安全）
- `localhost` URL（MetaMask 無法訪問）
