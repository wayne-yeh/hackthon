# 為什麼需要 ngrok？簡單解釋

## 問題說明

### 當前情況：

- ✅ 瀏覽器可以訪問：`http://localhost:8081/api/metadata/download?key=ipfs://...`
- ✅ Metadata JSON 包含：`"image": "https://picsum.photos/id/237/200/300"`
- ❌ MetaMask 顯示空白圖片

### 為什麼？

當 MetaMask 導入 NFT 時，它會：

1. **調用合約的 `tokenURI()` 方法**

   - 得到：`http://localhost:8081/api/metadata/download?key=ipfs://...`

2. **嘗試訪問這個 URL 獲取 metadata JSON**

   - ❌ **這裡失敗了！** MetaMask 無法訪問 `localhost`

3. **因為無法訪問 metadata URI，所以無法獲取圖片 URL**
   - 即使圖片 URL 是公開的 `https://...`，MetaMask 也不知道是什麼

### 為什麼 MetaMask 無法訪問 localhost？

- MetaMask 是**瀏覽器擴展程序**
- 瀏覽器擴展程序有**安全限制**
- 即使在同一台機器上，擴展程序也可能被阻止訪問 `localhost`
- 這是為了安全考慮，防止惡意擴展程序訪問本地服務

### ngrok 的作用

ngrok 創建一個**隧道**，將你的本地服務器暴露到互聯網：

```
你的電腦               互聯網
localhost:8081  --->  https://abc123.ngrok.io
(只能本地訪問)         (所有人都能訪問)
```

這樣 MetaMask 就可以通過公開的 HTTPS URL 訪問你的 metadata 服務器了。

## 不需要 ngrok 的情況

如果你的 MetaMask 和服務器**確實在同一台機器上**，並且：

1. **MetaMask 可以訪問 localhost**（檢查 Network 請求）
2. **問題在圖片 URL 本身**（例如圖片 URL 無法訪問）

那麼可能不需要 ngrok。

## 如何確認是否需要 ngrok？

### 步驟 1: 檢查 MetaMask 的 Network 請求

1. 打開 Chrome DevTools（按 F12）
2. 切換到 **Network** 標籤
3. 在 MetaMask 中導入 NFT
4. 查看是否有對 `localhost:8081` 的請求

**如果沒有請求**：

- MetaMask 無法訪問 localhost
- **需要 ngrok**

**如果有請求但失敗了**：

- 查看錯誤信息
- 可能是 CORS 或其他問題

**如果請求成功但圖片仍然空白**：

- 問題可能在圖片 URL
- 檢查圖片 URL 是否可訪問

### 步驟 2: 測試圖片 URL

```bash
# 測試圖片 URL 是否可訪問
curl -I "https://picsum.photos/id/237/200/300"
```

如果返回錯誤（如 405），使用其他圖片 URL：

- `https://picsum.photos/200/300`
- `https://via.placeholder.com/200/300.png`

## 總結

**ngrok 的作用**：讓 MetaMask 能夠訪問你的本地服務器

**什麼時候需要**：

- MetaMask 無法訪問 localhost metadata URI
- 需要在互聯網上公開訪問你的服務器

**什麼時候不需要**：

- MetaMask 可以訪問 localhost（很少見）
- 問題在圖片 URL 或其他地方

**建議**：先檢查 MetaMask 的 Network 請求，確認是否真的無法訪問 localhost。
