// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TARReceipt
 * @dev Tokenized Asset Receipt (TAR) ERC-721 contract with access control and metadata verification
 * @notice This contract allows authorized issuers to mint NFT receipts for tokenized assets
 */
contract TARReceipt is ERC721, AccessControl, ERC2981, Pausable {
    // Roles
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // State variables
    uint256 private _tokenIdCounter;
    mapping(uint256 => bytes32) private _metaHashes;
    mapping(uint256 => bool) private _revokedTokens;
    mapping(uint256 => string) private _tokenURIs;

    // Events
    event Minted(uint256 indexed tokenId, address indexed to, bytes32 indexed metaHash);
    event Revoked(uint256 indexed tokenId);

    // Errors
    error TokenRevoked(uint256 tokenId);
    error InvalidTokenURI(string tokenURI);
    error InvalidRecipient(address recipient);
    error TokenAlreadyRevoked(uint256 tokenId);
    error InvalidMetaHash(bytes32 providedHash, bytes32 storedHash);

    /**
     * @dev Constructor that sets up the contract with default admin role
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param defaultAdmin The address that will have DEFAULT_ADMIN_ROLE
     */
    constructor(
        string memory name,
        string memory symbol,
        address defaultAdmin
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    /**
     * @dev Mint a new TAR receipt to the specified address
     * @param to The address to mint the token to
     * @param uri The metadata URI for the token
     * @param metaHash The hash of the metadata for verification
     * @notice Only addresses with ISSUER_ROLE can call this function
     */
    function mint(
        address to,
        string memory uri,
        bytes32 metaHash
    ) external onlyRole(ISSUER_ROLE) whenNotPaused {
        if (to == address(0)) {
            revert InvalidRecipient(to);
        }
        if (bytes(uri).length == 0) {
            revert InvalidTokenURI(uri);
        }

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        _metaHashes[tokenId] = metaHash;

        emit Minted(tokenId, to, metaHash);
    }

    /**
     * @dev Revoke a TAR receipt, marking it as invalid
     * @param tokenId The ID of the token to revoke
     * @notice Only addresses with ISSUER_ROLE can call this function
     */
    function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) whenNotPaused {
        try this.ownerOf(tokenId) returns (address) {
            // Token exists, continue
        } catch {
            revert TokenRevoked(tokenId);
        }
        if (_revokedTokens[tokenId]) {
            revert TokenAlreadyRevoked(tokenId);
        }

        _revokedTokens[tokenId] = true;
        emit Revoked(tokenId);
    }

    /**
     * @dev Verify if a token's metadata hash matches and the token is not revoked
     * @param tokenId The ID of the token to verify
     * @param metaHash The metadata hash to verify against
     * @return bool True if the token is valid and hash matches, false otherwise
     */
    function verify(uint256 tokenId, bytes32 metaHash) external view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            // Token exists
        } catch {
            return false;
        }
        if (_revokedTokens[tokenId]) {
            return false;
        }
        return _metaHashes[tokenId] == metaHash;
    }

    /**
     * @dev Get the metadata hash for a specific token
     * @param tokenId The ID of the token
     * @return bytes32 The metadata hash for the token
     */
    function getMetaHash(uint256 tokenId) external view returns (bytes32) {
        try this.ownerOf(tokenId) returns (address) {
            // Token exists
        } catch {
            revert TokenRevoked(tokenId);
        }
        return _metaHashes[tokenId];
    }

    /**
     * @dev Check if a token has been revoked
     * @param tokenId The ID of the token to check
     * @return bool True if the token is revoked, false otherwise
     */
    function isRevoked(uint256 tokenId) external view returns (bool) {
        return _revokedTokens[tokenId];
    }

    /**
     * @dev Pause the contract to prevent minting and revoking
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract to allow minting and revoking
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Set the royalty information for the contract
     * @param receiver The address to receive royalties
     * @param feeNumerator The royalty fee numerator (basis points)
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev Set royalty information for a specific token
     * @param tokenId The ID of the token
     * @param receiver The address to receive royalties
     * @param feeNumerator The royalty fee numerator (basis points)
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /**
     * @dev Get the current token counter value
     * @return uint256 The current token counter value
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override tokenURI to return stored URI
     * @param tokenId The ID of the token
     * @return string The token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Override supportsInterface to include ERC2981
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _update to check for revoked tokens
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (_revokedTokens[tokenId]) {
            revert TokenRevoked(tokenId);
        }
        return super._update(to, tokenId, auth);
    }
}
