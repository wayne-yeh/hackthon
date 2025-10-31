# TAR DApp - Tokenized Asset Receipt Frontend

基於 Next.js 的 Tokenized Asset Receipt (TAR) 前端應用，支持 WalletConnect v2 和 imToken 錢包集成。

## 🚀 功能特色

- **錢包連接**: 支持 WalletConnect v2 和 imToken 錢包
- **收據發行**: 發行新的 Tokenized Asset Receipt
- **收據驗證**: 驗證收據的真實性和有效性
- **我的收據**: 查看和管理擁有的收據
- **QR 碼生成**: 生成驗證用的 QR 碼
- **響應式設計**: 支持桌面和移動設備

## 📋 頁面結構

- `/` - 首頁：錢包連接和功能介紹
- `/issuer` - 發行頁面：發行新的收據（需要授權）
- `/verify` - 驗證頁面：驗證收據有效性
- `/my` - 我的收據：查看擁有的收據

## 🛠 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **錢包**: WalletConnect v2, imToken
- **區塊鏈**: viem, wagmi
- **測試**: Jest, React Testing Library, Playwright
- **狀態管理**: React Query
- **表單**: React Hook Form
- **通知**: React Hot Toast

## 📦 安裝和運行

### 環境要求

- Node.js >= 18.0.0
- npm 或 yarn

### 安裝依賴

```bash
npm install
```

### 環境配置

複製環境變量模板：

```bash
cp env.sample .env.local
```

編輯 `.env.local` 文件：

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8083
NEXT_PUBLIC_ISSUER_TOKEN=change-this-in-production

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Development
NODE_ENV=development
```

### 開發模式

```bash
npm run dev
```

應用將在 `http://localhost:3000` 運行。

### 生產構建

```bash
npm run build
npm run start
```

## 🧪 測試

### 單元測試

```bash
# 運行所有測試
npm test

# 監聽模式
npm run test:watch

# 生成覆蓋率報告
npm run test:coverage
```

### E2E 測試

```bash
# 運行 E2E 測試
npm run test:e2e

# 使用 UI 模式
npm run test:e2e:ui
```

## 🔧 開發指南

### 項目結構

```
src/
├── app/                 # Next.js App Router 頁面
│   ├── globals.css      # 全局樣式
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 首頁
│   ├── issuer/          # 發行頁面
│   ├── verify/          # 驗證頁面
│   └── my/              # 我的收據頁面
├── components/          # React 組件
│   ├── NFTCard.tsx     # NFT 卡片組件
│   ├── VerifyBadge.tsx # 驗證狀態徽章
│   ├── QRGenerator.tsx  # QR 碼生成器
│   ├── WalletConnectButton.tsx # 錢包連接按鈕
│   └── ReceiptForm.tsx  # 收據表單
├── hooks/               # 自定義 Hooks
│   └── useWalletConnect.ts # 錢包連接 Hook
├── services/            # API 服務
│   ├── apiClients.ts    # API 客戶端
│   └── blockchainService.ts # 區塊鏈服務
├── types/               # TypeScript 類型定義
│   └── index.ts
└── utils/               # 工具函數
```

### 組件開發

所有組件都使用 TypeScript 和 Tailwind CSS 開發，遵循以下原則：

- 使用函數組件和 Hooks
- 提供完整的 TypeScript 類型定義
- 支持響應式設計
- 包含適當的錯誤處理
- 提供測試覆蓋

### API 集成

應用使用端口 8083 與後端 API 通信，支持以下端點：

- `POST /api/v1/receipts/issue` - 發行收據
- `POST /api/v1/receipts/verify` - 驗證收據
- `GET /api/v1/receipts/{id}/details` - 獲取收據詳情
- `POST /api/v1/receipts/{id}/revoke` - 撤銷收據
- `GET /api/v1/receipts/owner/{address}` - 獲取擁有者收據

### 錢包集成

使用 WalletConnect v2 和 imToken 錢包：

- 支持 QR 碼掃描連接
- 支持深鏈接連接
- 自動處理賬戶和鏈變更
- 提供連接狀態管理

## 🚀 部署

### Docker 部署

```bash
# 構建 Docker 鏡像
docker build -t tar-dapp .

# 運行容器
docker run -p 3000:3000 tar-dapp
```

### Vercel 部署

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 🔒 安全考慮

- API Key 認證用於受保護的端點
- 輸入驗證和清理
- 安全的錢包連接
- HTTPS 強制使用（生產環境）

## 📝 API 文檔

詳細的 API 文檔請參考 [CURL 測試指南](../3.Backend%20Core%20API/CURL_TESTING_GUIDE.md)。

## 🤝 貢獻

1. Fork 項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

此項目使用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🆘 支持

如有問題或建議，請：

1. 查看 [Issues](../../issues) 頁面
2. 創建新的 Issue
3. 聯繫開發團隊

## 🔗 相關項目

- [Smart Contract Service](../1.Smart%20Contract%20Service/) - 智能合約服務
- [Metadata Service](../2.Metadata%20Service/) - 元數據服務
- [Backend Core API](../3.Backend%20Core%20API/) - 後端核心 API
- [Verification Service](../4.Verification%20Service/) - 驗證服務











