# MetaMask 如何讀取圖片 URL

## ERC721 Metadata 標準

MetaMask 遵循 **ERC721 Metadata JSON Schema** 標準，標準規定：

### 必須包含的字段：

- `name`: NFT 名稱
- `description`: NFT 描述
- `image`: **圖片 URL（這是 MetaMask 會讀取的字段）**

### 可選字段：

- `imageUrl`: 額外字段（MetaMask 不會讀取）
- `attributes`: 屬性
- `external_url`: 外部連結
- 等等...

## MetaMask 的讀取流程

### 步驟 1: 獲取 metadata URI

```
MetaMask 調用合約的 tokenURI(tokenId)
↓
得到：http://localhost:8081/api/metadata/download?key=ipfs://...
```

### 步驟 2: 訪問 metadata URI 獲取 JSON

```
MetaMask 訪問 metadata URI
↓
獲取 JSON：
{
  "name": "TAR Receipt #INV-TEST-25236",
  "description": "...",
  "image": "https://picsum.photos/id/237/200/300",  ← 這裡！
  "imageUrl": "https://picsum.photos/id/237/200/300",
  ...
}
```

### 步驟 3: 讀取 'image' 字段 ⭐

```
MetaMask 讀取 JSON 中的 "image" 字段
↓
得到：https://picsum.photos/id/237/200/300
```

**重點**：MetaMask **只會讀取 `image` 字段**，不會讀取 `imageUrl` 或其他字段！

### 步驟 4: 訪問圖片 URL

```
MetaMask 訪問 "image" 字段中的 URL
↓
顯示圖片
```

## 我們的代碼已經正確設置了

查看 `MetadataJsonBuilderService.java`：

```java
// Set ERC721 standard fields for NFT compatibility
metadata.setName("TAR Receipt #" + invoiceNo);
metadata.setDescription("...");
metadata.setImage(imageUrl); // ← 這裡設置了 'image' 字段
```

所以我們的 JSON 包含：

- ✅ `"image"`: MetaMask 會讀取這個
- ✅ `"imageUrl"`: 額外字段（MetaMask 不會讀取）

## 總結

**MetaMask 會讀取 `image` 字段作為圖片 URL**

- ✅ 我們的代碼已經正確設置了 `image` 字段
- ✅ JSON 包含 `"image": "https://picsum.photos/200/300"`
- ✅ MetaMask 會讀取這個字段

**問題不在於字段名稱**，而在於：

1. MetaMask 無法訪問 localhost metadata URI（需要 ngrok）
2. 圖片 URL 可能需要是可訪問的
