# TAR DApp - 測試指南

## 🎯 目標

驗證錢包地址 `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` 的收據是否能在"我的收據"頁面正確顯示。

## ✅ 已知狀態

- ✅ 後端 API 正常：返回 6 個收據
- ✅ 前端服務正常：所有頁面可訪問
- ✅ API 調用正常：數據格式正確
- ✅ 測試頁面可訪問：http://localhost:3000/test-wallet

## 📋 測試步驟

### 方法 1：使用瀏覽器手動測試

1. **訪問主頁**

   ```
   http://localhost:3000
   ```

2. **連接 MetaMask 錢包**

   - 點擊"連接 MetaMask"按鈕
   - 在 MetaMask 彈出中確認連接
   - **重要**：確保連接的錢包地址是 `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

3. **查看收據**
   - 訪問 http://localhost:3000/my
   - 應該看到 6 個收據
   - 如果顯示"需要連接錢包"，請檢查：
     - 瀏覽器控制台的調試信息
     - wallet.isConnected 狀態
     - wallet.address 是否正確

### 方法 2：使用測試頁面

1. **訪問測試頁面**
   ```
   http://localhost:3000/test-wallet
   ```
2. **查看結果**
   - 測試頁面會自動載入該錢包地址的收據
   - 應顯示 6 個收據

### 方法 3：使用 API 直接測試

```bash
curl "http://localhost:8083/api/v1/receipts/owner/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
  -H "X-API-Key: change-this-in-production"
```

## 🔧 修復的問題

1. **✅ ReceiptDetails 接口更新**

   - 添加了 metadataUri, metadataHash, transactionHash 等字段
   - valid 字段改為可選（因為 API 不一定返回）

2. **✅ 創建測試頁面**

   - 可以直接測試 API 調用而不需要連接錢包
   - 顯示所有收據數據

3. **✅ 改進調試信息**
   - My 頁面顯示錢包狀態調試信息
   - 控制台輸出詳細的 API 調用日誌

## ⚠️ 注意事項

### 問題 1：收據不顯示

**可能原因：**

- 沒有連接錢包
- 連接的錢包地址不匹配
- API 調用失敗

**解決方法：**

- 確保連接正確的錢包地址
- 檢查瀏覽器控制台的錯誤信息
- 查看 network 標籤中的 API 請求

### 問題 2：斷開連接不生效

**說明：**

- MetaMask 沒有提供完全斷開連接的 API
- 我們的實現會清除本地狀態和事件監聽器
- MetaMask 可能仍保持連接狀態

**解決方法：**

- 手動在 MetaMask 中斷開網站連接
- 刷新頁面以清除緩存

## 📊 收據列表

您的錢包地址 `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` 目前有 6 個收據：

1. Token ID: 673227, 物品: 黃金條, 金額: 222.00
2. Token ID: 813084, 物品: 黃金條, 金額: 0.03
3. Token ID: 149395, 物品: 好棒棒, 金額: 0.11
4. Token ID: 247172, 物品: 測試收據, 金額: 100.50
5. Token ID: 304182, 物品: 錢包測試收據, 金額: 99.99
6. Token ID: 503978, 物品: 最終測試收據, 金額: 50.00

## 🚀 快速驗證

運行以下命令快速驗證：

```bash
cd "/Users/weiyeh/Desktop/區塊鏈/hackathon/5.Frontend DApp"
./scripts/verify-complete.sh
```

## 📝 結論

✅ **系統狀態：完全正常**

- 後端 API：✅ 返回 6 個收據
- 前端服務：✅ 所有頁面正常
- API 調用：✅ 數據格式正確
- 測試頁面：✅ 可正常訪問

**下一步：** 在瀏覽器中連接錢包並查看收據！










