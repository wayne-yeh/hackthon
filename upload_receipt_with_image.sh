#!/bin/bash

# 使用 curl API 發行帶圖片的收據
# 用法: ./upload_receipt_with_image.sh <圖片路徑>

# 檢查參數
if [ -z "$1" ]; then
    echo "用法: $0 <圖片路徑>"
    echo ""
    echo "範例:"
    echo "  $0 ./my_image.jpg"
    echo "  $0 /path/to/image.png"
    exit 1
fi

IMAGE_PATH="$1"

# 檢查圖片檔案是否存在
if [ ! -f "$IMAGE_PATH" ]; then
    echo "錯誤: 圖片檔案不存在: $IMAGE_PATH"
    exit 1
fi

echo "📸 正在轉換圖片為 base64..."
# 將圖片轉換為 base64（移除換行符）
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

echo "📤 正在發行收據..."
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
    \"imageBase64\": \"$IMAGE_BASE64\"
}")

echo ""
echo "=== 發行結果 ==="
echo "$RESPONSE" | python3 -m json.tool

# 提取 tokenId 和 metadataUri
TOKEN_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('tokenId', 'N/A'))" 2>/dev/null)
METADATA_URI=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('metadataUri', 'N/A'))" 2>/dev/null)

if [ "$TOKEN_ID" != "N/A" ] && [ "$METADATA_URI" != "N/A" ]; then
    echo ""
    echo "✅ Token ID: $TOKEN_ID"
    echo "🔗 Metadata URI: $METADATA_URI"
    echo ""
    echo "📄 正在獲取 metadata JSON（檢查圖片 URL）..."
    curl -s "$METADATA_URI" | python3 -m json.tool | grep -E "name|description|image|imageUrl" | head -10
fi

