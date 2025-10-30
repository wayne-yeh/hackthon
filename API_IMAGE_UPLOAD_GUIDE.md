# API 圖片上傳指南

## 使用 curl 發行帶圖片的收據

### 方法 1: 使用腳本（推薦）

```bash
# 使用提供的腳本
./upload_receipt_with_image.sh /path/to/your/image.jpg
```

### 方法 2: 手動使用 curl

#### 步驟 1: 將圖片轉換為 base64

**在 macOS/Linux:**

```bash
IMAGE_BASE64=$(base64 -i your_image.jpg | tr -d '\n')
```

**在 Windows (PowerShell):**

```powershell
$bytes = [System.IO.File]::ReadAllBytes("your_image.jpg")
$ImageBase64 = [System.Convert]::ToBase64String($bytes)
```

#### 步驟 2: 發行收據（包含圖片）

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data "{
    \"invoiceNo\": \"INV-TEST-$(date +%s)\",
    \"purchaseDate\": \"2024-01-15\",
    \"amount\": 1000.5,
    \"itemName\": \"測試商品\",
    \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\",
    \"description\": \"這是一個測試收據\",
    \"imageBase64\": \"$IMAGE_BASE64\"
}"
```

### 方法 3: 一行命令（適用於小圖片）

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data "{
    \"invoiceNo\": \"INV-TEST-$(date +%s)\",
    \"purchaseDate\": \"2024-01-15\",
    \"amount\": 1000.5,
    \"itemName\": \"測試商品\",
    \"ownerAddress\": \"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\",
    \"description\": \"這是一個測試收據\",
    \"imageBase64\": \"$(base64 -i your_image.jpg | tr -d '\n')\"
}"
```

## 完整範例

### 範例 1: 使用變數（較清晰）

```bash
#!/bin/bash

# 設定變數
INVOICE_NO="INV-TEST-$(date +%s)"
PURCHASE_DATE="2024-01-15"
AMOUNT=1000.5
ITEM_NAME="測試商品"
OWNER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
DESCRIPTION="這是一個測試收據"
IMAGE_PATH="./my_image.jpg"

# 轉換圖片為 base64
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

# 發行收據
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data "{
    \"invoiceNo\": \"$INVOICE_NO\",
    \"purchaseDate\": \"$PURCHASE_DATE\",
    \"amount\": $AMOUNT,
    \"itemName\": \"$ITEM_NAME\",
    \"ownerAddress\": \"$OWNER_ADDRESS\",
    \"description\": \"$DESCRIPTION\",
    \"imageBase64\": \"$IMAGE_BASE64\"
}"
```

### 範例 2: 不帶圖片（可選）

如果不提供 `imageBase64` 欄位，收據將不包含圖片：

```bash
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-1231333226",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據"
}'
```

## 驗證圖片是否成功上傳

### 步驟 1: 獲取 Token ID

從響應中提取 `tokenId`：

```json
{
    "tokenId": 123,
    "metadataUri": "ipfs://...",
    ...
}
```

### 步驟 2: 訪問 Metadata URI

訪問 `metadataUri` 應該會看到包含 `image` 欄位的 JSON：

```json
{
    "name": "TAR Receipt #INV-TEST-1231333226",
    "description": "Tokenized Asset Receipt - 測試商品 (Amount: 1000.5 TWD, Date: 2024-01-15)",
    "image": "http://localhost:8081/api/metadata/download?key=images/image_xxx.png",
    "invoiceNo": "INV-TEST-1231333226",
    ...
}
```

### 步驟 3: 查看圖片

直接訪問 `image` URL 應該能看到上傳的圖片：

```bash
curl http://localhost:8081/api/metadata/download?key=images/image_xxx.png
```

## 支援的圖片格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## 注意事項

1. **圖片大小限制**: 建議小於 10MB，過大的圖片可能導致請求超時
2. **Base64 編碼**: 確保 base64 字符串沒有換行符（使用 `tr -d '\n'`）
3. **JSON 轉義**: 在 bash 中使用雙引號並轉義內部引號，或使用單引號包裹整個 JSON
4. **MetaMask 顯示**: 圖片 URL 必須是可公開訪問的，本地開發環境可能需要配置代理或使用 IPFS

## 故障排除

### 問題 1: Base64 編碼錯誤

```bash
# 確保使用正確的命令
base64 -i image.jpg  # macOS
base64 image.jpg     # Linux
```

### 問題 2: JSON 格式錯誤

```bash
# 使用 python 驗證 JSON
echo "$JSON_DATA" | python3 -m json.tool
```

### 問題 3: 圖片太大

```bash
# 先壓縮圖片（需要 ImageMagick）
convert -resize 1024x1024 -quality 85 input.jpg output.jpg
```
