// scripts/verify.ts
import { ethers } from "hardhat";
import crypto from "crypto";

// Node 18+ 有全域 fetch；若舊版請安裝 node-fetch 並改為 import fetch from "node-fetch";

function sha256Hex(buf: Buffer) {
  return "0x" + crypto.createHash("sha256").update(buf).digest("hex");
}

async function keccak256Hex(buf: Buffer) {
  const { keccak256 } = await import("ethers");
  const hex = keccak256(buf);
  return hex.toLowerCase().startsWith("0x") ? hex : ("0x" + hex);
}

async function readStoredMetaAndRevoked(contract: any, tokenId: bigint) {
  try {
    const r = await contract.receipt(tokenId);
    return { storedHash: r.metaHash as string, revoked: Boolean(r.revoked) };
  } catch {
    const [storedHash, revoked] = await Promise.all([
      contract.getMetaHash(tokenId),
      contract.isRevoked(tokenId),
    ]);
    return { storedHash, revoked };
  }
}

function normalizeIpfs(uri: string) {
  return uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
    : uri;
}

async function main() {
  console.log("🔍 Verifying TAR Receipt...");

  // --- 讀取部署地址 ---
  const addresses = require("../deploy/addresses.json");
  const contractAddress: string =
    addresses.TARReceipt ??
    addresses.contractAddress ??
    (() => {
      throw new Error("No contract address in deploy/addresses.json");
    })();

  // --- 取得 tokenId（用環境變數 TOKEN_ID，預設 0）---
  const tokenId = BigInt(process.env.TOKEN_ID ?? "0");
  console.log("Token ID to verify:", tokenId.toString());

  // --- 取得合約 ---
  const contract = await ethers.getContractAt("TARReceipt", contractAddress);

  // --- 讀鏈上資料 ---
  const owner = await contract.ownerOf(tokenId);
  const tokenURI: string = await contract.tokenURI(tokenId);
  const { storedHash, revoked } = await readStoredMetaAndRevoked(
    contract,
    tokenId
  );
  console.log("Owner:", owner);
  console.log("tokenURI:", tokenURI);
  console.log("Stored metaHash:", storedHash);
  console.log("Is revoked:", revoked);

  // --- 下載 metadata ---
  const url = normalizeIpfs(tokenURI);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Fetch metadata failed: ${res.status} ${res.statusText} (${url})`
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());

  // --- 計算兩種 hash 並比較 ---
  const sha = sha256Hex(buf);
  const kec = await keccak256Hex(buf);

  const shaMatch = storedHash.toLowerCase() === sha.toLowerCase();
  const kecMatch = storedHash.toLowerCase() === kec.toLowerCase();

  console.log("Computed SHA-256 :", sha);
  console.log("Computed keccak  :", kec);
  console.log("Match (SHA-256)? :", shaMatch);
  console.log("Match (keccak)?  :", kecMatch);

  // --- 用命中的那個 hash 呼叫 verify()（若都沒命中，先用 SHA 測）---
  const candidate = shaMatch ? sha : kecMatch ? kec : sha;
  const ok: boolean = await contract.verify(tokenId, candidate);
  console.log("Contract verify() result:", ok);

  console.log("\n📋 Verification Details:");
  console.log("==================================================");
  console.log("Token ID     :", tokenId.toString());
  console.log("Owner        :", owner);
  console.log("Stored Hash  :", storedHash);
  console.log("SHA-256      :", sha, `(${shaMatch ? "MATCH" : "NO MATCH"})`);
  console.log("keccak256    :", kec, `(${kecMatch ? "MATCH" : "NO MATCH"})`);
  console.log("Revoked      :", revoked);
  console.log("Final Result :", ok && !revoked ? "✅ VALID" : "❌ INVALID");

  if (!shaMatch && !kecMatch) {
    console.error("\n⚠️  Hash mismatch → 可能原因：");
    console.error("   1) mint 當下算法與現在驗證算法不同（SHA vs keccak）");
    console.error("   2) metadata 檔案在上鏈後被改過（空白/排序/內容）");
    console.error("   3) 連到不同部署的合約或不同本機鏈");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌ Error during verification:", e);
  process.exit(1);
});
