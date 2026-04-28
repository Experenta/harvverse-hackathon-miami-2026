// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract LotCertificate is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error NonTransferable();

    uint256 private _nextTokenId = 1;

    mapping(uint256 tokenId => bytes32 proposalHash) public proposalHashOf;
    mapping(uint256 tokenId => uint256 partnershipId) public partnershipIdOf;

    event CertificateMinted(
        uint256 indexed tokenId,
        uint256 indexed partnershipId,
        address indexed to,
        bytes32 proposalHash
    );

    constructor(address admin) ERC721("Harvverse Lot Certificate", "HVLOT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mintCertificate(
        address to,
        uint256 partnershipId,
        bytes32 proposalHash
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        proposalHashOf[tokenId] = proposalHash;
        partnershipIdOf[tokenId] = partnershipId;
        _safeMint(to, tokenId);
        emit CertificateMinted(tokenId, partnershipId, to, proposalHash);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address previousOwner) {
        previousOwner = _ownerOf(tokenId);
        if (previousOwner != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
