#!/bin/bash

# TAR DApp - 設置驗證腳本

echo "🔍 TAR DApp 設置驗證"
echo "===================="

# 檢查 Node.js 版本
echo "📦 檢查 Node.js 版本..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 版本: $NODE_VERSION"
    
    # 檢查版本是否 >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "✅ Node.js 版本符合要求 (>= 18)"
    else
        echo "❌ Node.js 版本不符合要求 (需要 >= 18)"
        exit 1
    fi
else
    echo "❌ Node.js 未安裝"
    exit 1
fi

# 檢查 npm
echo ""
echo "📦 檢查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm 版本: $NPM_VERSION"
else
    echo "❌ npm 未安裝"
    exit 1
fi

# 檢查依賴
echo ""
echo "📦 檢查依賴..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules 目錄存在"
else
    echo "❌ node_modules 目錄不存在，請運行 'npm install'"
    exit 1
fi

# 檢查環境變量文件
echo ""
echo "🔧 檢查環境變量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    
    # 檢查必要的環境變量
    if grep -q "NEXT_PUBLIC_API_BASE_URL" .env.local; then
        echo "✅ NEXT_PUBLIC_API_BASE_URL 已設置"
    else
        echo "⚠️  NEXT_PUBLIC_API_BASE_URL 未設置"
    fi
    
    if grep -q "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID" .env.local; then
        echo "✅ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID 已設置"
    else
        echo "⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID 未設置"
    fi
else
    echo "⚠️  .env.local 文件不存在，請運行 'cp env.sample .env.local'"
fi

# 檢查 TypeScript 配置
echo ""
echo "🔧 檢查 TypeScript 配置..."
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json 存在"
else
    echo "❌ tsconfig.json 不存在"
    exit 1
fi

# 檢查 Next.js 配置
echo ""
echo "🔧 檢查 Next.js 配置..."
if [ -f "next.config.js" ]; then
    echo "✅ next.config.js 存在"
else
    echo "❌ next.config.js 不存在"
    exit 1
fi

# 檢查 Tailwind 配置
echo ""
echo "🔧 檢查 Tailwind 配置..."
if [ -f "tailwind.config.js" ]; then
    echo "✅ tailwind.config.js 存在"
else
    echo "❌ tailwind.config.js 不存在"
    exit 1
fi

# 檢查測試配置
echo ""
echo "🧪 檢查測試配置..."
if [ -f "jest.config.js" ]; then
    echo "✅ jest.config.js 存在"
else
    echo "❌ jest.config.js 不存在"
    exit 1
fi

if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts 存在"
else
    echo "❌ playwright.config.ts 不存在"
    exit 1
fi

# 檢查源代碼結構
echo ""
echo "📁 檢查源代碼結構..."
REQUIRED_DIRS=("src/app" "src/components" "src/hooks" "src/services" "src/types" "src/utils" "tests/unit" "tests/e2e")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir 目錄存在"
    else
        echo "❌ $dir 目錄不存在"
        exit 1
    fi
done

# 檢查關鍵文件
echo ""
echo "📄 檢查關鍵文件..."
REQUIRED_FILES=("src/app/layout.tsx" "src/app/page.tsx" "src/app/globals.css" "src/hooks/useWalletConnect.ts" "src/services/apiClients.ts")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
        exit 1
    fi
done

echo ""
echo "🎉 設置驗證完成！"
echo ""
echo "📋 下一步："
echo "1. 編輯 .env.local 文件設置環境變量"
echo "2. 運行 'npm run dev' 啟動開發服務器"
echo "3. 訪問 http://localhost:3000"
echo ""
echo "🧪 運行測試："
echo "- 單元測試: npm test"
echo "- E2E 測試: npm run test:e2e"
echo ""
echo "📚 更多信息請查看 README.md"











