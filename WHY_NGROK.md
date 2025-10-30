# 為什麼 MetaMask 可能無法顯示圖片？

## 問題根源

### MetaMask 如何獲取 NFT 圖片：

1. **調用合約的 `tokenURI()` 方法**

   - 例如：`tokenURI(0)` 返回 `http://localhost:8081/api/metadata/download?key=ipfs://xxx`

2. **從 tokenURI 獲取 metadata JSON**

   - MetaMask 需要訪問這個 URL 來獲取 JSON
   - JSON 中包含 `image` 字段，例如：`"image": "https://picsum.photos/id/237/200/300"`

3. **從 metadata JSON 獲取圖片 URL**
   - MetaMask 訪問 `image` 字段中的 URL 來顯示圖片

### 問題在哪裡？

**如果 metadata URI 是 `http://localhost:8081/...`：**

- ✅ **瀏覽器可以訪問**：因為你在同一台機器上
- ❌ **MetaMask 可能無法訪問**：因為：
  - MetaMask 是瀏覽器擴展程序，運行在獨立的環境中
  - 瀏覽器擴展程序有安全限制，可能無法訪問 `localhost`
  - 即使在同一台機器上，擴展程序也可能被阻止訪問本地服務器

### ngrok 的作用

ngrok 將你的本地服務器（`localhost:8081`）暴露到互聯網上，提供一個公開的 HTTPS URL：

```
本地：http://localhost:8081
     ↓ ngrok
公開：https://abc123.ngrok.io
```

這樣 MetaMask 就可以通過公開的 URL 訪問你的 metadata 服務器了。

## 但是！你可能不需要 ngrok

### 方案 1: 測試 MetaMask 是否能訪問 localhost

如果你**在同一個機器上運行 MetaMask 和服務器**，理論上 MetaMask 應該能夠訪問 localhost。

請檢查：

1. 打開瀏覽器開發者工具（F12）
2. 查看 Network 標籤
3. 在 MetaMask 中導入 NFT
4. 查看是否有對 `localhost:8081` 的請求
5. 如果有請求但失敗了，看看錯誤信息是什麼

### 方案 2: 使用 127.0.0.1 而不是 localhost

有時候使用 IP 地址而不是域名可以解決問題：

修改 `application.yml`：

```yaml
app:
  metadata:
    base-url: http://127.0.0.1:8081
```

### 方案 3: 檢查實際問題

可能問題不是 localhost，而是：

1. **圖片 URL 無法訪問**：`https://picsum.photos/id/237/200/300` 可能返回錯誤
2. **CORS 問題**：雖然我們添加了 CORS，但可能需要檢查
3. **Metadata JSON 格式問題**：雖然我們確認了格式正確

## 快速診斷步驟

### 步驟 1: 檢查瀏覽器是否能訪問 metadata

```bash
# 在瀏覽器中打開：
http://localhost:8081/api/metadata/download?key=ipfs://8c2db66d-f2a2-4b77-8756-cd0ebf812c5e
```

如果瀏覽器**可以**訪問，但 MetaMask **不能**，那就是瀏覽器擴展程序的限制。

### 步驟 2: 檢查 MetaMask 的網絡請求

1. 打開 Chrome DevTools（F12）
2. 切換到 Network 標籤
3. 在 MetaMask 中導入 NFT
4. 查看是否有對 `localhost:8081` 的請求
5. 如果有，查看狀態碼和錯誤信息

### 步驟 3: 測試不同的圖片 URL

可能問題不在 metadata URI，而在圖片 URL：

```bash
# 嘗試使用不同的圖片 URL
curl --location 'http://localhost:8083/api/v1/receipts/issue' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: change-this-in-production' \
--data '{
    "invoiceNo": "INV-TEST-127-'$(date +%s)'",
    "purchaseDate": "2024-01-15",
    "amount": 1000.5,
    "itemName": "測試商品",
    "ownerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "description": "這是一個測試收據",
    "imageBase64": "https://via.placeholder.com/200/300.png"
}'
```

## 總結

- **ngrok 的作用**：將本地服務器暴露到互聯網，讓 MetaMask 可以通過公開 URL 訪問
- **什麼時候需要**：當 MetaMask 確實在同一台機器上但無法訪問 localhost 時
- **什麼時候不需要**：如果 MetaMask 可以訪問 localhost，或者問題在圖片 URL 本身

**建議**：先測試 MetaMask 的網絡請求，確認問題是否真的在 localhost，還是其他原因。
