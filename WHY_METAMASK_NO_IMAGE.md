# MetaMask 為什麼無法讀到圖片檔？

## 問題分析

### 當前情況：

- ✅ Metadata URL 返回 JSON 是正確的
- ✅ JSON 包含 `image` 字段：`"image": "https://picsum.photos/id/237/200/300"`
- ❌ MetaMask 顯示空白圖片

## 為什麼 MetaMask 讀不到圖片？

### 原因 1: MetaMask 無法訪問 localhost metadata URI（最可能）⚠️

**問題流程**：

1. MetaMask 調用合約 `tokenURI(0)`

   - 得到：`http://localhost:8081/api/metadata/download?key=ipfs://...`

2. MetaMask 嘗試訪問這個 URL 來獲取 JSON

   - ❌ **失敗！** MetaMask 無法訪問 `localhost`
   - 瀏覽器擴展程序有安全限制

3. 因為無法獲取 JSON，所以：
   - ❌ 無法讀取 `image` 字段
   - ❌ 無法知道圖片 URL
   - ❌ 顯示空白圖片

**驗證方法**：

1. 打開 Chrome DevTools（F12）
2. 切換到 Network 標籤
3. 在 MetaMask 中導入 NFT
4. 查看是否有對 `localhost:8081` 的請求
   - 如果**沒有請求** → MetaMask 無法訪問 localhost
   - 如果有請求但**失敗** → 查看錯誤信息

### 原因 2: 圖片 URL 無法訪問

**即使 MetaMask 能獲取 JSON**，如果圖片 URL 無法訪問，也會顯示空白。

**測試**：

```bash
# 測試圖片 URL
curl -I "https://picsum.photos/id/237/200/300"
```

如果返回 405 或其他錯誤，使用其他圖片 URL：

- `https://picsum.photos/200/300`
- `https://via.placeholder.com/200/300.png`

### 原因 3: CORS 問題

雖然我們添加了 CORS 配置，但可能需要檢查：

- CORS 頭部是否正確返回
- MetaMask 的請求是否被阻止

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

### 確保圖片 URL 可訪問

使用可靠的圖片 URL：

```bash
"imageBase64": "https://via.placeholder.com/200/300.png"
```

## 診斷步驟

### 步驟 1: 檢查 MetaMask 的 Network 請求

1. 打開 Chrome DevTools（按 F12）
2. 切換到 **Network** 標籤
3. 在 MetaMask 中導入 NFT（Token ID: 4）
4. 查看請求：

**如果有對 `localhost:8081` 的請求**：

- ✅ MetaMask 嘗試訪問 metadata URI
- 查看請求狀態：
  - 如果失敗 → 問題在 localhost 訪問
  - 如果成功 → 問題在圖片 URL

**如果沒有對 `localhost:8081` 的請求**：

- ❌ MetaMask 無法訪問 localhost
- **需要使用 ngrok**

### 步驟 2: 檢查圖片 URL 請求

如果能看到對圖片 URL 的請求（如 `picsum.photos`）：

- 查看請求狀態：
  - 如果失敗 → 圖片 URL 無法訪問
  - 如果成功 → 可能是其他問題（緩存、格式等）

## 總結

**MetaMask 無法讀到圖片的原因**：

1. **最可能**：MetaMask 無法訪問 localhost metadata URI

   - 無法獲取 JSON
   - 無法知道圖片 URL
   - 顯示空白圖片

2. **次可能**：MetaMask 能獲取 JSON，但圖片 URL 無法訪問

   - 能獲取 JSON
   - 知道圖片 URL
   - 但訪問圖片 URL 時失敗

3. **其他**：CORS、緩存、格式等問題

**解決方案**：

- 使用 ngrok 暴露 localhost 為公開 URL
- 確保圖片 URL 可訪問
- 檢查 MetaMask 的 Network 請求來確認問題
