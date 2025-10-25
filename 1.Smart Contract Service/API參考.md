# TAR 收據合約服務 - API 參考

## 📋 概述

本文檔提供了 TAR 收據合約服務的完整 API 參考，包括智能合約函數、事件、錯誤代碼以及 JavaScript/TypeScript 集成示例。

## 🔧 智能合約 API

### 核心函數

#### mint - 鑄造 TAR 收據

```solidity
function mint(
    address to,
    string memory uri,
    bytes32 metaHash
) external onlyRole(ISSUER_ROLE) whenNotPaused
```

**參數：**

- `to` (address): 接收代幣的地址
- `uri` (string): 代幣的元數據 URI
- `metaHash` (bytes32): 元數據的加密哈希

**權限：** 僅限 ISSUER_ROLE
**狀態：** 合約未暫停時可用

**事件：**

```solidity
event Minted(uint256 indexed tokenId, address indexed to, bytes32 indexed metaHash);
```

**錯誤：**

- `InvalidRecipient(address recipient)` - 接收者為零地址
- `InvalidTokenURI(string tokenURI)` - TokenURI 為空
- `AccessControlUnauthorizedAccount` - 無 ISSUER_ROLE 權限
- `EnforcedPause` - 合約已暫停

#### revoke - 撤銷 TAR 收據

```solidity
function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) whenNotPaused
```

**參數：**

- `tokenId` (uint256): 要撤銷的代幣 ID

**權限：** 僅限 ISSUER_ROLE
**狀態：** 合約未暫停時可用

**事件：**

```solidity
event Revoked(uint256 indexed tokenId);
```

**錯誤：**

- `TokenRevoked(uint256 tokenId)` - 代幣不存在
- `TokenAlreadyRevoked(uint256 tokenId)` - 代幣已撤銷
- `AccessControlUnauthorizedAccount` - 無 ISSUER_ROLE 權限
- `EnforcedPause` - 合約已暫停

#### verify - 驗證 TAR 收據

```solidity
function verify(uint256 tokenId, bytes32 metaHash) external view returns (bool)
```

**參數：**

- `tokenId` (uint256): 要驗證的代幣 ID
- `metaHash` (bytes32): 要驗證的元數據哈希

**返回值：**

- `bool`: true 如果代幣有效且哈希匹配，false 否則

**狀態：** 視圖函數，無 Gas 消耗

### 查詢函數

#### getMetaHash - 獲取元數據哈希

```solidity
function getMetaHash(uint256 tokenId) external view returns (bytes32)
```

**參數：**

- `tokenId` (uint256): 代幣 ID

**返回值：**

- `bytes32`: 存儲的元數據哈希

**錯誤：**

- `TokenRevoked(uint256 tokenId)` - 代幣不存在

#### isRevoked - 檢查撤銷狀態

```solidity
function isRevoked(uint256 tokenId) external view returns (bool)
```

**參數：**

- `tokenId` (uint256): 代幣 ID

**返回值：**

- `bool`: true 如果代幣已撤銷，false 否則

#### getCurrentTokenId - 獲取當前代幣計數器

```solidity
function getCurrentTokenId() external view returns (uint256)
```

**返回值：**

- `uint256`: 當前代幣計數器值

### 角色管理函數

#### grantRole - 授予角色

```solidity
function grantRole(bytes32 role, address account) external
```

**參數：**

- `role` (bytes32): 角色標識符
- `account` (address): 要授予角色的地址

**權限：** 僅限 DEFAULT_ADMIN_ROLE

#### revokeRole - 撤銷角色

```solidity
function revokeRole(bytes32 role, address account) external
```

**參數：**

- `role` (bytes32): 角色標識符
- `account` (address): 要撤銷角色的地址

**權限：** 僅限 DEFAULT_ADMIN_ROLE

#### hasRole - 檢查角色

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

**參數：**

- `role` (bytes32): 角色標識符
- `account` (address): 要檢查的地址

**返回值：**

- `bool`: true 如果地址具有該角色，false 否則

### 暫停控制函數

#### pause - 暫停合約

```solidity
function pause() external
```

**權限：** 僅限 DEFAULT_ADMIN_ROLE

#### unpause - 取消暫停

```solidity
function unpause() external
```

**權限：** 僅限 DEFAULT_ADMIN_ROLE

#### paused - 檢查暫停狀態

```solidity
function paused() external view returns (bool)
```

**返回值：**

- `bool`: true 如果合約已暫停，false 否則

### 版稅管理函數

#### setDefaultRoyalty - 設置默認版稅

```solidity
function setDefaultRoyalty(address receiver, uint96 feeNumerator) external
```

**參數：**

- `receiver` (address): 版稅接收者
- `feeNumerator` (uint96): 版稅費率分子（基點）

**權限：** 僅限 DEFAULT_ADMIN_ROLE

#### setTokenRoyalty - 設置代幣版稅

```solidity
function setTokenRoyalty(
    uint256 tokenId,
    address receiver,
    uint96 feeNumerator
) external
```

**參數：**

- `tokenId` (uint256): 代幣 ID
- `receiver` (address): 版稅接收者
- `feeNumerator` (uint96): 版稅費率分子（基點）

**權限：** 僅限 DEFAULT_ADMIN_ROLE

#### royaltyInfo - 獲取版稅信息

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256)
```

**參數：**

- `tokenId` (uint256): 代幣 ID
- `salePrice` (uint256): 銷售價格

**返回值：**

- `address`: 版稅接收者
- `uint256`: 版稅金額

## 📝 事件定義

### Minted 事件

```solidity
event Minted(uint256 indexed tokenId, address indexed to, bytes32 indexed metaHash);
```

**觸發時機：** 成功鑄造 TAR 收據時
**參數：**

- `tokenId`: 鑄造的代幣 ID
- `to`: 接收者地址
- `metaHash`: 元數據哈希

### Revoked 事件

```solidity
event Revoked(uint256 indexed tokenId);
```

**觸發時機：** 成功撤銷 TAR 收據時
**參數：**

- `tokenId`: 被撤銷的代幣 ID

## ❌ 錯誤代碼

### 自定義錯誤

```solidity
error InvalidRecipient(address recipient);
error InvalidTokenURI(string tokenURI);
error TokenRevoked(uint256 tokenId);
error TokenAlreadyRevoked(uint256 tokenId);
error InvalidMetaHash(bytes32 providedHash, bytes32 storedHash);
```

### 標準錯誤

- `AccessControlUnauthorizedAccount` - 訪問控制錯誤
- `EnforcedPause` - 合約暫停錯誤
- `ERC721NonexistentToken` - 代幣不存在錯誤

## 🔧 JavaScript/TypeScript 集成

### 初始化合約

```typescript
import { ethers } from "ethers";
import TARReceiptABI from "./deploy/TARReceipt.json";

// 初始化提供者
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(privateKey, provider);

// 初始化合約
const contractAddress = "0x...";
const tarReceipt = new ethers.Contract(contractAddress, TARReceiptABI, wallet);
```

### 鑄造 TAR 收據

```typescript
async function mintTARReceipt(
  to: string,
  tokenURI: string,
  metadata: object
): Promise<ethers.TransactionResponse> {
  // 計算元數據哈希
  const metadataHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(metadata))
  );

  // 鑄造代幣
  const tx = await tarReceipt.mint(to, tokenURI, metadataHash);
  await tx.wait();

  return tx;
}
```

### 驗證 TAR 收據

```typescript
async function verifyTARReceipt(
  tokenId: number,
  metadata: object
): Promise<boolean> {
  // 計算元數據哈希
  const metadataHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(metadata))
  );

  // 驗證代幣
  const isValid = await tarReceipt.verify(tokenId, metadataHash);

  return isValid;
}
```

### 撤銷 TAR 收據

```typescript
async function revokeTARReceipt(
  tokenId: number
): Promise<ethers.TransactionResponse> {
  const tx = await tarReceipt.revoke(tokenId);
  await tx.wait();

  return tx;
}
```

### 查詢代幣信息

```typescript
async function getTokenInfo(tokenId: number) {
  const [owner, tokenURI, metaHash, isRevoked] = await Promise.all([
    tarReceipt.ownerOf(tokenId),
    tarReceipt.tokenURI(tokenId),
    tarReceipt.getMetaHash(tokenId),
    tarReceipt.isRevoked(tokenId),
  ]);

  return {
    owner,
    tokenURI,
    metaHash,
    isRevoked,
  };
}
```

### 事件監聽

```typescript
// 監聽鑄造事件
tarReceipt.on("Minted", (tokenId, to, metaHash, event) => {
  console.log(`代幣 ${tokenId} 已鑄造給 ${to}`);
  console.log(`元數據哈希: ${metaHash}`);
});

// 監聽撤銷事件
tarReceipt.on("Revoked", (tokenId, event) => {
  console.log(`代幣 ${tokenId} 已被撤銷`);
});
```

## 🛠️ 部署腳本 API

### deploy.ts

```typescript
// 部署合約
const tarReceipt = await TARReceiptFactory.deploy(
  "Tokenized Asset Receipt",
  "TAR",
  deployer.address
);

// 保存部署信息
const deploymentInfo = {
  network: hre.network.name,
  contractAddress: contractAddress,
  deployer: deployer.address,
  deploymentTime: new Date().toISOString(),
  contractName: "TARReceipt",
  constructorArgs: {
    name: "Tokenized Asset Receipt",
    symbol: "TAR",
    defaultAdmin: deployer.address,
  },
};
```

### setIssuer.ts

```typescript
// 授予 ISSUER_ROLE
const tx = await tarReceipt.grantRole(ISSUER_ROLE, issuer.address);
await tx.wait();

// 驗證角色
const hasRole = await tarReceipt.hasRole(ISSUER_ROLE, issuer.address);
```

### mint.ts

```typescript
// 鑄造參數
const tokenURI = "https://example.com/metadata/tar-receipt-1";
const metadataContent = JSON.stringify({
  name: "Tokenized Asset Receipt #1",
  description: "A tokenized asset receipt for a valuable asset",
  // ... 更多元數據
});
const metaHash = ethers.keccak256(ethers.toUtf8Bytes(metadataContent));

// 鑄造代幣
const tx = await tarReceipt
  .connect(issuer)
  .mint(buyer.address, tokenURI, metaHash);
```

### verify.ts

```typescript
// 驗證參數
const tokenId = 0;
const providedHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));

// 執行驗證
const isValid = await tarReceipt.verify(tokenId, providedHash);
```

### revoke.ts

```typescript
// 撤銷代幣
const tx = await tarReceipt.connect(issuer).revoke(tokenId);
await tx.wait();
```

## 📊 Gas 估算

### 函數 Gas 消耗

| 函數           | Gas 消耗 | 說明           |
| -------------- | -------- | -------------- |
| `mint`         | ~150,000 | 包含存儲和事件 |
| `revoke`       | ~45,000  | 狀態更新       |
| `verify`       | ~2,500   | 視圖函數       |
| `transferFrom` | ~65,000  | 標準轉移       |
| `grantRole`    | ~35,000  | 角色管理       |
| `pause`        | ~25,000  | 暫停合約       |

### Gas 優化建議

1. **批量操作**: 儘量批量處理多個操作
2. **存儲優化**: 使用高效的存儲模式
3. **函數合併**: 將相關操作合併到一個函數中
4. **事件優化**: 只記錄必要的事件數據

## 🔒 安全最佳實踐

### 1. 權限管理

```typescript
// 檢查權限
const hasIssuerRole = await tarReceipt.hasRole(ISSUER_ROLE, address);
if (!hasIssuerRole) {
  throw new Error("無 ISSUER_ROLE 權限");
}
```

### 2. 輸入驗證

```typescript
// 驗證地址
if (to === ethers.ZeroAddress) {
  throw new Error("接收者不能為零地址");
}

// 驗證 URI
if (!tokenURI || tokenURI.length === 0) {
  throw new Error("TokenURI 不能為空");
}
```

### 3. 錯誤處理

```typescript
try {
  const tx = await tarReceipt.mint(to, tokenURI, metaHash);
  await tx.wait();
} catch (error) {
  if (error.code === "ACCESS_CONTROL_UNAUTHORIZED_ACCOUNT") {
    console.error("無權限執行此操作");
  } else if (error.code === "ENFORCED_PAUSE") {
    console.error("合約已暫停");
  } else {
    console.error("未知錯誤:", error.message);
  }
}
```

## 📚 參考資源

- [OpenZeppelin 文檔](https://docs.openzeppelin.com/)
- [Hardhat 文檔](https://hardhat.org/docs)
- [ethers.js 文檔](https://docs.ethers.io/)
- [ERC-721 標準](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-2981 標準](https://eips.ethereum.org/EIPS/eip-2981)

---

**本文檔持續更新，如有問題請聯繫開發團隊。**

