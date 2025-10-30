# MetaMask NFT 顯示流程說明

## 正確的流程

### 1. MetaMask 調用合約的 `tokenURI(tokenId)`

返回：`http://localhost:8081/api/metadata/download?key=ipfs://...`

### 2. MetaMask 訪問這個 URL，獲取 JSON ⚠️

**這是正確的！metadata URL 應該返回 JSON，不是圖片！**

返回的 JSON：

```json
{
  "name": "TAR Receipt #INV-TEST-25236",
  "description": "...",
  "image": "https://picsum.photos/id/237/200/300",  ← 圖片 URL 在這裡
  ...
}
```

### 3. MetaMask 讀取 JSON 中的 `image` 字段

得到圖片 URL：`https://picsum.photos/id/237/200/300`

### 4. MetaMask 訪問圖片 URL 來顯示圖片 🖼️

這裡應該顯示圖片

## 問題在哪裡？

### 問題 1: MetaMask 無法訪問 localhost metadata URI ⚠️

**當前情況**：

- ✅ 瀏覽器可以訪問 `http://localhost:8081/api/metadata/download?key=ipfs://...`
- ✅ 返回正確的 JSON，包含 `image` 字段
- ❌ MetaMask 無法訪問 `localhost`

**為什麼**：

- MetaMask 是瀏覽器擴展程序
- 有安全限制，無法訪問 `localhost`
- 即使在同一台機器上也不行

**解決方案**：使用 ngrok 或部署到公共服務器

### 問題 2: 圖片 URL 可能無法訪問

即使 MetaMask 能獲取到 metadata JSON，如果圖片 URL 無法訪問，也會顯示空白。

**測試圖片 URL**：

```bash
curl -I "https://picsum.photos/id/237/200/300"
```

如果返回 405 或其他錯誤，使用其他圖片 URL：

- `https://picsum.photos/200/300`
- `https://via.placeholder.com/200/300.png`

## 解決方案

### 必須解決：MetaMask 訪問 localhost 的問題

**使用 ngrok**：

```bash
# 1. 安裝 ngrok
brew install ngrok

# 2. 啟動 ngrok
ngrok http 8081

# 3. 複製 HTTPS URL（例如：https://abc123.ngrok.io）

# 4. 修改配置
# 編輯 2.Metadata Service/src/main/resources/application.yml
app:
  metadata:
    base-url: https://abc123.ngrok.io

# 5. 重啟服務
# 6. 重新發行收據
```

然後 metadata URI 會變成：

```
https://abc123.ngrok.io/api/metadata/download?key=ipfs://...
```

MetaMask 就可以訪問了！

## 總結

- ✅ **metadata URL 返回 JSON 是正確的**（應該這樣）
- ✅ **JSON 中包含 `image` 字段**
- ❌ **MetaMask 無法訪問 localhost metadata URI**
- ❓ **圖片 URL 可能也有問題**

**關鍵**：MetaMask 需要訪問 metadata URI 來獲取 JSON，然後才能知道圖片 URL。如果無法訪問 localhost，就需要使用 ngrok 或部署到公共服務器。
