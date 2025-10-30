#!/bin/bash

# 使用 curl API 發行帶圖片的收據 - 完整範例

# ===== 設定參數 =====
# 請修改以下變數
IMAGE_PATH="./test_image.jpg"  # 請替換成你的圖片路徑
INVOICE_NO="INV-TEST-$(date +%s)"
PURCHASE_DATE="2024-01-15"
AMOUNT=1000.5
ITEM_NAME="測試商品"
OWNER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
DESCRIPTION="這是一個測試收據"

# ===== 檢查圖片是否存在 =====
if [ ! -f "$IMAGE_PATH" ]; then
    echo "❌ 錯誤: 圖片檔案不存在: $IMAGE_PATH"
    echo ""
    echo "請先創建一個測試圖片，或修改 IMAGE_PATH 變數指向現有圖片"
    exit 1
fi

echo "📸 正在讀取圖片: $IMAGE_PATH"
echo "📝 發票號碼: $INVOICE_NO"
echo ""

# ===== 將圖片轉換為 base64 =====
echo "🔄 正在轉換圖片為 base64..."
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')
echo "✅ Base64 編碼完成 (長度: ${#IMAGE_BASE64} 字符)"
echo ""

# ===== 發行收據 =====
echo "📤 正在發行收據..."
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

echo ""
echo "=== 📋 發行結果 ==="
echo "$RESPONSE" | python3 -m json.tool

# ===== 提取並顯示關鍵資訊 =====
TOKEN_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('tokenId', 'N/A'))" 2>/dev/null)
METADATA_URI=$(echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('metadataUri', 'N/A'))" 2>/dev/null)

if [ "$TOKEN_ID" != "N/A" ] && [ "$METADATA_URI" != "N/A" ]; then
    echo ""
    echo "=== ✅ 成功 ==="
    echo "Token ID: $TOKEN_ID"
    echo "Metadata URI: $METADATA_URI"
    echo ""
    echo "=== 📄 檢查 Metadata JSON ==="
    echo "正在獲取 metadata..."
    METADATA_JSON=$(curl -s "$METADATA_URI")
    echo "$METADATA_JSON" | python3 -m json.tool | grep -E "name|description|image|imageUrl" | head -6
    echo ""
    echo "=== 🖼️ 圖片 URL ==="
    IMAGE_URL=$(echo "$METADATA_JSON" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('image', d.get('imageUrl', 'N/A')))" 2>/dev/null)
    echo "$IMAGE_URL"
fi

