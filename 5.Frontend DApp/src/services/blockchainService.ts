import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { hardhat } from 'viem/chains';
import { ReceiptDetails } from '@/types';

// Contract ABI for TARReceipt
const TAR_RECEIPT_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" },
      { "name": "metadataHash", "type": "bytes32" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "revoke",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "isRevoked",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "index", "type": "uint256" }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

class BlockchainService {
  private client: any;
  private contractAddress: string;

  constructor() {
    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337');
    const rpcUrl = chainId === 31337 ? 'http://localhost:8545' : `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;
    
    this.client = createPublicClient({
      chain: hardhat,
      transport: http(rpcUrl),
    });

    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  }

  // Get contract name
  async getContractName(): Promise<string> {
    return await this.client.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: TAR_RECEIPT_ABI,
      functionName: 'name',
    });
  }

  // Get contract symbol
  async getContractSymbol(): Promise<string> {
    return await this.client.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: TAR_RECEIPT_ABI,
      functionName: 'symbol',
    });
  }

  // Get owner of a token
  async getTokenOwner(tokenId: number): Promise<string> {
    return await this.client.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: TAR_RECEIPT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });
  }

  // Check if token is revoked
  async isTokenRevoked(tokenId: number): Promise<boolean> {
    return await this.client.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: TAR_RECEIPT_ABI,
      functionName: 'isRevoked',
      args: [BigInt(tokenId)],
    });
  }

  // Get token URI
  async getTokenURI(tokenId: number): Promise<string> {
    return await this.client.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: TAR_RECEIPT_ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });
  }

  // Get balance of an address
  async getBalance(address: string): Promise<number> {
    const balance = await this.client.readContract({
      address: this.contractAddress as `0x${string}`,
      abi: TAR_RECEIPT_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    return Number(balance);
  }

  // Get token IDs owned by an address
  async getTokenIdsByOwner(ownerAddress: string): Promise<number[]> {
    const balance = await this.getBalance(ownerAddress);
    const tokenIds: number[] = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await this.client.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: TAR_RECEIPT_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [ownerAddress as `0x${string}`, BigInt(i)],
      });
      tokenIds.push(Number(tokenId));
    }

    return tokenIds;
  }

  // Get detailed NFT information
  async getNFTDetails(tokenId: number): Promise<{
    owner: string;
    revoked: boolean;
    tokenURI: string;
  }> {
    const [owner, revoked, tokenURI] = await Promise.all([
      this.getTokenOwner(tokenId),
      this.isTokenRevoked(tokenId),
      this.getTokenURI(tokenId),
    ]);

    return {
      owner,
      revoked,
      tokenURI,
    };
  }

  // Get all NFTs owned by an address with details
  async getOwnedNFTs(ownerAddress: string): Promise<Array<{
    tokenId: number;
    owner: string;
    revoked: boolean;
    tokenURI: string;
  }>> {
    const tokenIds = await this.getTokenIdsByOwner(ownerAddress);
    
    const nftDetails = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const details = await this.getNFTDetails(tokenId);
        return {
          tokenId,
          ...details,
        };
      })
    );

    return nftDetails;
  }
}

// Create singleton instance
export const blockchainService = new BlockchainService();

// Export individual methods for convenience
export const {
  getContractName,
  getContractSymbol,
  getTokenOwner,
  isTokenRevoked,
  getTokenURI,
  getBalance,
  getTokenIdsByOwner,
  getNFTDetails,
  getOwnedNFTs,
} = blockchainService;
