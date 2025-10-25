// 簡單的本地元數據服務器
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// 設置靜態文件服務
app.use(express.static(path.join(__dirname, 'metadata')));

// 示例元數據
const sampleMetadata = {
  "name": "TAR Receipt #1",
  "description": "Tokenized Asset Receipt for Real Estate",
  "image": "https://example.com/image.jpg",
  "attributes": [
    {
      "trait_type": "Asset Type",
      "value": "Real Estate"
    },
    {
      "trait_type": "Location",
      "value": "Taipei, Taiwan"
    },
    {
      "trait_type": "Value",
      "value": "50000000 TWD"
    },
    {
      "trait_type": "Area",
      "value": "100 sqm"
    }
  ],
  "external_url": "https://example.com/asset/1",
  "background_color": "ffffff"
};

// 提供示例元數據
app.get('/metadata/tar-receipt-1', (req, res) => {
  res.json(sampleMetadata);
});

// 提供其他示例元數據
app.get('/metadata/:id', (req, res) => {
  const id = req.params.id;
  const metadata = {
    ...sampleMetadata,
    name: `TAR Receipt #${id}`,
    description: `Tokenized Asset Receipt #${id}`,
    attributes: [
      ...sampleMetadata.attributes,
      {
        "trait_type": "Token ID",
        "value": id
      }
    ]
  };
  res.json(metadata);
});

app.listen(PORT, () => {
  console.log(`📄 Metadata server running at http://localhost:${PORT}`);
  console.log(`📄 Sample metadata available at: http://localhost:${PORT}/metadata/tar-receipt-1`);
});
