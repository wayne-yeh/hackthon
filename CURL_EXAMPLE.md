# Curl API 圖片上傳範例

## 方法 1: 一行命令（快速測試）

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

## 方法 2: 使用變數（推薦）

```bash
# 設定圖片路徑
IMAGE_PATH="./test_image.jpg"

# 轉換圖片為 base64
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

# 發行收據
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

## 方法 3: 完整腳本範例

```bash
#!/bin/bash

# 設定參數
IMAGE_PATH="./my_image.jpg"
INVOICE_NO="INV-TEST-$(date +%s)"
PURCHASE_DATE="2024-01-15"
AMOUNT=1000.5
ITEM_NAME="測試商品"
OWNER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
DESCRIPTION="這是一個測試收據"

# 轉換圖片為 base64
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

# 發行收據
RESPONSE=$(curl -s --location 'http://localhost:8083/api/v1/receipts/issue' \
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
}")

# 顯示結果
echo "$RESPONSE" | python3 -m json.tool
```

## 方法 4: 使用提供的腳本

```bash
# 使用項目根目錄的腳本
./curl_example_with_image.sh
```

## 不帶圖片（可選）

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

## 驗證結果

### 檢查 Metadata JSON

```bash
# 從響應中獲取 metadataUri，然後訪問它
curl "http://localhost:8081/api/metadata/download?key=metadata/metadata_INV-TEST-xxx.json" | python3 -m json.tool
```

應該會看到：

```json
{
    "name": "TAR Receipt #INV-TEST-1231333226",
    "description": "Tokenized Asset Receipt - 測試商品 (Amount: 1000.5 TWD, Date: 2024-01-15)",
    "image": "http://localhost:8081/api/metadata/download?key=images/image_xxx.png",
    "imageUrl": "http://localhost:8081/api/metadata/download?key=images/image_xxx.png",
    ...
}
```

### 檢查圖片

```bash
# 訪問圖片 URL
curl "http://localhost:8081/api/metadata/download?key=images/image_xxx.png" --output downloaded_image.png
```

## 測試範例

創建一個測試圖片並發行收據：

```bash
# 1. 創建一個測試圖片（需要 ImageMagick）
convert -size 400x300 xc:blue -pointsize 40 -fill white -gravity center \
  -annotate +0+0 "TEST\nIMAGE" test_image.jpg

# 2. 發行收據
./curl_example_with_image.sh
```

## 常見問題

### Q: base64 編碼失敗？

A: 確保使用正確的命令：

- macOS: `base64 -i image.jpg`
- Linux: `base64 image.jpg`

### Q: JSON 格式錯誤？

A: 在 bash 中使用雙引號包裹 JSON，並轉義內部引號：

```bash
--data "{\"key\": \"value\"}"
```

### Q: 圖片太大？

A: 先壓縮圖片（需要 ImageMagick）：

```bash
convert -resize 1024x1024 -quality 85 input.jpg output.jpg
```
