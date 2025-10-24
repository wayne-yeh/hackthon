import { expect } from "chai";
import { ethers } from "hardhat";
import { TARReceipt } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("TARReceipt", function () {
  // Test fixtures
  async function deployTARReceiptFixture() {
    const [owner, issuer, buyer, unauthorized] = await ethers.getSigners();

    const TARReceiptFactory = await ethers.getContractFactory("TARReceipt");
    const tarReceipt = await TARReceiptFactory.deploy(
      "Tokenized Asset Receipt",
      "TAR",
      owner.address
    );

    // Grant ISSUER_ROLE to issuer
    await tarReceipt.grantRole(await tarReceipt.ISSUER_ROLE(), issuer.address);

    return { tarReceipt, owner, issuer, buyer, unauthorized };
  }

  async function mintTokenFixture() {
    const { tarReceipt, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
    
    const tokenURI = "https://example.com/metadata/1";
    const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
    
    await tarReceipt.connect(issuer).mint(buyer.address, tokenURI, metaHash);
    
    return { tarReceipt, issuer, buyer, tokenURI, metaHash };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { tarReceipt } = await loadFixture(deployTARReceiptFixture());
      
      expect(await tarReceipt.name()).to.equal("Tokenized Asset Receipt");
      expect(await tarReceipt.symbol()).to.equal("TAR");
    });

    it("Should set the correct default admin role", async function () {
      const { tarReceipt, owner } = await loadFixture(deployTARReceiptFixture());
      
      expect(await tarReceipt.hasRole(await tarReceipt.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should start with token counter at 0", async function () {
      const { tarReceipt } = await loadFixture(deployTARReceiptFixture());
      
      expect(await tarReceipt.getCurrentTokenId()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant ISSUER_ROLE", async function () {
      const { tarReceipt, owner, issuer } = await loadFixture(deployTARReceiptFixture());
      
      await tarReceipt.grantRole(await tarReceipt.ISSUER_ROLE(), issuer.address);
      expect(await tarReceipt.hasRole(await tarReceipt.ISSUER_ROLE(), issuer.address)).to.be.true;
    });

    it("Should allow admin to revoke ISSUER_ROLE", async function () {
      const { tarReceipt, owner, issuer } = await loadFixture(deployTARReceiptFixture());
      
      await tarReceipt.grantRole(await tarReceipt.ISSUER_ROLE(), issuer.address);
      await tarReceipt.revokeRole(await tarReceipt.ISSUER_ROLE(), issuer.address);
      expect(await tarReceipt.hasRole(await tarReceipt.ISSUER_ROLE(), issuer.address)).to.be.false;
    });

    it("Should not allow non-admin to grant roles", async function () {
      const { tarReceipt, unauthorized, issuer } = await loadFixture(deployTARReceiptFixture());
      
      await expect(
        tarReceipt.connect(unauthorized).grantRole(await tarReceipt.ISSUER_ROLE(), issuer.address)
      ).to.be.revertedWithCustomError(tarReceipt, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    it("Should mint token successfully with correct parameters", async function () {
      const { tarReceipt, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const tokenURI = "https://example.com/metadata/1";
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      
      await expect(tarReceipt.connect(issuer).mint(buyer.address, tokenURI, metaHash))
        .to.emit(tarReceipt, "Minted")
        .withArgs(0, buyer.address, metaHash);
      
      expect(await tarReceipt.ownerOf(0)).to.equal(buyer.address);
      expect(await tarReceipt.tokenURI(0)).to.equal(tokenURI);
      expect(await tarReceipt.getMetaHash(0)).to.equal(metaHash);
      expect(await tarReceipt.getCurrentTokenId()).to.equal(1);
    });

    it("Should store metaHash correctly", async function () {
      const { tarReceipt, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("test metadata"));
      await tarReceipt.connect(issuer).mint(buyer.address, "https://example.com/1", metaHash);
      
      expect(await tarReceipt.getMetaHash(0)).to.equal(metaHash);
    });

    it("Should emit Minted event with correct parameters", async function () {
      const { tarReceipt, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const tokenURI = "https://example.com/metadata/1";
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      
      await expect(tarReceipt.connect(issuer).mint(buyer.address, tokenURI, metaHash))
        .to.emit(tarReceipt, "Minted")
        .withArgs(0, buyer.address, metaHash);
    });

    it("Should revert when minting to zero address", async function () {
      const { tarReceipt, issuer } = await loadFixture(deployTARReceiptFixture());
      
      const tokenURI = "https://example.com/metadata/1";
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      
      await expect(
        tarReceipt.connect(issuer).mint(ethers.ZeroAddress, tokenURI, metaHash)
      ).to.be.revertedWithCustomError(tarReceipt, "InvalidRecipient");
    });

    it("Should revert when tokenURI is empty", async function () {
      const { tarReceipt, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      
      await expect(
        tarReceipt.connect(issuer).mint(buyer.address, "", metaHash)
      ).to.be.revertedWithCustomError(tarReceipt, "InvalidTokenURI");
    });

    it("Should revert when called by non-issuer", async function () {
      const { tarReceipt, unauthorized, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const tokenURI = "https://example.com/metadata/1";
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      
      await expect(
        tarReceipt.connect(unauthorized).mint(buyer.address, tokenURI, metaHash)
      ).to.be.revertedWithCustomError(tarReceipt, "AccessControlUnauthorizedAccount");
    });

    it("Should revert when contract is paused", async function () {
      const { tarReceipt, owner, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
      
      await tarReceipt.connect(owner).pause();
      
      const tokenURI = "https://example.com/metadata/1";
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      
      await expect(
        tarReceipt.connect(issuer).mint(buyer.address, tokenURI, metaHash)
      ).to.be.revertedWithCustomError(tarReceipt, "EnforcedPause");
    });
  });

  describe("Verification", function () {
    it("Should return true for valid token with matching hash", async function () {
      const { tarReceipt, metaHash } = await loadFixture(mintTokenFixture());
      
      expect(await tarReceipt.verify(0, metaHash)).to.be.true;
    });

    it("Should return false for valid token with wrong hash", async function () {
      const { tarReceipt } = await loadFixture(mintTokenFixture());
      
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong metadata"));
      expect(await tarReceipt.verify(0, wrongHash)).to.be.false;
    });

    it("Should return false for non-existent token", async function () {
      const { tarReceipt } = await loadFixture(deployTARReceiptFixture());
      
      const metaHash = ethers.keccak256(ethers.toUtf8Bytes("metadata content"));
      expect(await tarReceipt.verify(999, metaHash)).to.be.false;
    });

    it("Should return false for revoked token", async function () {
      const { tarReceipt, issuer, metaHash } = await loadFixture(mintTokenFixture());
      
      await tarReceipt.connect(issuer).revoke(0);
      expect(await tarReceipt.verify(0, metaHash)).to.be.false;
    });
  });

  describe("Revoking", function () {
    it("Should revoke token successfully", async function () {
      const { tarReceipt, issuer } = await loadFixture(mintTokenFixture());
      
      await expect(tarReceipt.connect(issuer).revoke(0))
        .to.emit(tarReceipt, "Revoked")
        .withArgs(0);
      
      expect(await tarReceipt.isRevoked(0)).to.be.true;
    });

    it("Should emit Revoked event with correct tokenId", async function () {
      const { tarReceipt, issuer } = await loadFixture(mintTokenFixture());
      
      await expect(tarReceipt.connect(issuer).revoke(0))
        .to.emit(tarReceipt, "Revoked")
        .withArgs(0);
    });

    it("Should revert when revoking non-existent token", async function () {
      const { tarReceipt, issuer } = await loadFixture(deployTARReceiptFixture());
      
      await expect(
        tarReceipt.connect(issuer).revoke(999)
      ).to.be.revertedWithCustomError(tarReceipt, "TokenRevoked");
    });

    it("Should revert when revoking already revoked token", async function () {
      const { tarReceipt, issuer } = await loadFixture(mintTokenFixture());
      
      await tarReceipt.connect(issuer).revoke(0);
      
      await expect(
        tarReceipt.connect(issuer).revoke(0)
      ).to.be.revertedWithCustomError(tarReceipt, "TokenAlreadyRevoked");
    });

    it("Should revert when called by non-issuer", async function () {
      const { tarReceipt, unauthorized } = await loadFixture(mintTokenFixture());
      
      await expect(
        tarReceipt.connect(unauthorized).revoke(0)
      ).to.be.revertedWithCustomError(tarReceipt, "AccessControlUnauthorizedAccount");
    });

    it("Should revert when contract is paused", async function () {
      const { tarReceipt, owner, issuer } = await loadFixture(mintTokenFixture());
      
      await tarReceipt.connect(owner).pause();
      
      await expect(
        tarReceipt.connect(issuer).revoke(0)
      ).to.be.revertedWithCustomError(tarReceipt, "EnforcedPause");
    });
  });

  describe("Token URI", function () {
    it("Should set and get tokenURI correctly", async function () {
      const { tarReceipt, buyer } = await loadFixture(mintTokenFixture());
      
      const expectedURI = "https://example.com/metadata/1";
      expect(await tarReceipt.tokenURI(0)).to.equal(expectedURI);
    });
  });

  describe("Pause/Unpause", function () {
    it("Should allow admin to pause contract", async function () {
      const { tarReceipt, owner } = await loadFixture(deployTARReceiptFixture());
      
      await tarReceipt.connect(owner).pause();
      expect(await tarReceipt.paused()).to.be.true;
    });

    it("Should allow admin to unpause contract", async function () {
      const { tarReceipt, owner } = await loadFixture(deployTARReceiptFixture());
      
      await tarReceipt.connect(owner).pause();
      await tarReceipt.connect(owner).unpause();
      expect(await tarReceipt.paused()).to.be.false;
    });

    it("Should not allow non-admin to pause", async function () {
      const { tarReceipt, unauthorized } = await loadFixture(deployTARReceiptFixture());
      
      await expect(
        tarReceipt.connect(unauthorized).pause()
      ).to.be.revertedWithCustomError(tarReceipt, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Royalty Management", function () {
    it("Should allow admin to set default royalty", async function () {
      const { tarReceipt, owner, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const receiver = buyer.address;
      const feeNumerator = 250; // 2.5%
      
      await tarReceipt.connect(owner).setDefaultRoyalty(receiver, feeNumerator);
      
      const royaltyInfo = await tarReceipt.royaltyInfo(0, 10000);
      expect(royaltyInfo[0]).to.equal(receiver);
      expect(royaltyInfo[1]).to.equal(250);
    });

    it("Should allow admin to set token-specific royalty", async function () {
      const { tarReceipt, owner, buyer } = await loadFixture(mintTokenFixture());
      
      const receiver = buyer.address;
      const feeNumerator = 500; // 5%
      
      await tarReceipt.connect(owner).setTokenRoyalty(0, receiver, feeNumerator);
      
      const royaltyInfo = await tarReceipt.royaltyInfo(0, 10000);
      expect(royaltyInfo[0]).to.equal(receiver);
      expect(royaltyInfo[1]).to.equal(500);
    });
  });

  describe("Token Transfers", function () {
    it("Should prevent transfer of revoked tokens", async function () {
      const { tarReceipt, issuer, buyer, unauthorized } = await loadFixture(mintTokenFixture());
      
      await tarReceipt.connect(issuer).revoke(0);
      
      await expect(
        tarReceipt.connect(buyer).transferFrom(buyer.address, unauthorized.address, 0)
      ).to.be.revertedWithCustomError(tarReceipt, "TokenRevoked");
    });

    it("Should allow transfer of non-revoked tokens", async function () {
      const { tarReceipt, buyer, unauthorized } = await loadFixture(mintTokenFixture());
      
      await tarReceipt.connect(buyer).transferFrom(buyer.address, unauthorized.address, 0);
      expect(await tarReceipt.ownerOf(0)).to.equal(unauthorized.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple mints correctly", async function () {
      const { tarReceipt, issuer, buyer } = await loadFixture(deployTARReceiptFixture());
      
      const tokenURI1 = "https://example.com/metadata/1";
      const tokenURI2 = "https://example.com/metadata/2";
      const metaHash1 = ethers.keccak256(ethers.toUtf8Bytes("metadata 1"));
      const metaHash2 = ethers.keccak256(ethers.toUtf8Bytes("metadata 2"));
      
      await tarReceipt.connect(issuer).mint(buyer.address, tokenURI1, metaHash1);
      await tarReceipt.connect(issuer).mint(buyer.address, tokenURI2, metaHash2);
      
      expect(await tarReceipt.getCurrentTokenId()).to.equal(2);
      expect(await tarReceipt.ownerOf(0)).to.equal(buyer.address);
      expect(await tarReceipt.ownerOf(1)).to.equal(buyer.address);
      expect(await tarReceipt.getMetaHash(0)).to.equal(metaHash1);
      expect(await tarReceipt.getMetaHash(1)).to.equal(metaHash2);
    });

    it("Should handle revoke idempotency correctly", async function () {
      const { tarReceipt, issuer } = await loadFixture(mintTokenFixture());
      
      // First revoke should succeed
      await tarReceipt.connect(issuer).revoke(0);
      expect(await tarReceipt.isRevoked(0)).to.be.true;
      
      // Second revoke should fail
      await expect(
        tarReceipt.connect(issuer).revoke(0)
      ).to.be.revertedWithCustomError(tarReceipt, "TokenAlreadyRevoked");
    });
  });

  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      const { tarReceipt } = await loadFixture(deployTARReceiptFixture());
      
      expect(await tarReceipt.supportsInterface("0x80ac58cd")).to.be.true; // ERC721
    });

    it("Should support AccessControl interface", async function () {
      const { tarReceipt } = await loadFixture(deployTARReceiptFixture());
      
      expect(await tarReceipt.supportsInterface("0x7965db0b")).to.be.true; // AccessControl
    });

    it("Should support ERC2981 interface", async function () {
      const { tarReceipt } = await loadFixture(deployTARReceiptFixture());
      
      expect(await tarReceipt.supportsInterface("0x2a55205a")).to.be.true; // ERC2981
    });
  });
});
