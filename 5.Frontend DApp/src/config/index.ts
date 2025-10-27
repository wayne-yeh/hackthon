// Next.js environment configuration
const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083',
    issuerToken: process.env.NEXT_PUBLIC_ISSUER_TOKEN || 'change-this-in-production',
  },
  wallet: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  },
  blockchain: {
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'),
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  app: {
    name: 'TAR DApp',
    description: 'Tokenized Asset Receipt DApp',
    version: '1.0.0',
  },
} as const;

export default config;
