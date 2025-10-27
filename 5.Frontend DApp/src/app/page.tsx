export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TAR</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">TAR DApp</h1>
            </div>
            <div className="text-sm text-gray-600">
              Tokenized Asset Receipt System
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TAR DApp 系統狀態
          </h1>
          <p className="text-xl text-gray-600">
            基於區塊鏈的資產收據代幣化系統
          </p>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Frontend Service */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">前端服務</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">狀態: <span className="text-green-600 font-medium">運行中</span></p>
              <p className="text-sm text-gray-600">端口: <span className="font-mono">3000</span></p>
              <p className="text-sm text-gray-600">URL: <span className="font-mono">http://localhost:3000</span></p>
            </div>
          </div>

          {/* Backend Core API */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Backend Core API</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">狀態: <span className="text-green-600 font-medium">運行中</span></p>
              <p className="text-sm text-gray-600">端口: <span className="font-mono">8083</span></p>
              <p className="text-sm text-gray-600">URL: <span className="font-mono">http://localhost:8083</span></p>
            </div>
          </div>

          {/* Metadata Service */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Metadata Service</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">狀態: <span className="text-green-600 font-medium">運行中</span></p>
              <p className="text-sm text-gray-600">端口: <span className="font-mono">8081</span></p>
              <p className="text-sm text-gray-600">URL: <span className="font-mono">http://localhost:8081</span></p>
            </div>
          </div>

          {/* Verification Service */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Verification Service</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">狀態: <span className="text-green-600 font-medium">運行中</span></p>
              <p className="text-sm text-gray-600">端口: <span className="font-mono">8082</span></p>
              <p className="text-sm text-gray-600">URL: <span className="font-mono">http://localhost:8082</span></p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/api-test"
              className="block p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <h4 className="font-medium text-orange-900">API 測試工具</h4>
              <p className="text-sm text-orange-700 mt-1">直接測試所有 API</p>
            </a>
            <a
              href="http://localhost:8083/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">Backend API 文檔</h4>
              <p className="text-sm text-blue-700 mt-1">查看 Swagger UI</p>
            </a>
            <a
              href="http://localhost:8081/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">Metadata API 文檔</h4>
              <p className="text-sm text-green-700 mt-1">查看 Swagger UI</p>
            </a>
            <a
              href="http://localhost:8082/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-medium text-purple-900">Verification API 文檔</h4>
              <p className="text-sm text-purple-700 mt-1">查看 Swagger UI</p>
            </a>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">系統信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>項目名稱:</strong> TAR DApp</p>
              <p className="text-gray-600"><strong>版本:</strong> 1.0.0</p>
              <p className="text-gray-600"><strong>技術棧:</strong> Next.js, React, TypeScript</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>後端技術:</strong> Spring Boot, Java 17</p>
              <p className="text-gray-600"><strong>數據庫:</strong> H2 (內存)</p>
              <p className="text-gray-600"><strong>區塊鏈:</strong> Hardhat 本地網絡</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}