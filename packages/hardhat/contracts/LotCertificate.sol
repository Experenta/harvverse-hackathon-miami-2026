// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract LotCertificate is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_UPDATER_ROLE = keccak256("METADATA_UPDATER_ROLE");

    error NonTransferable();

    uint256 private _nextTokenId = 1;

    struct LotMetadata {
        string status;
        uint256 yieldQQ;
        uint256 scaScoreTenths;
        uint256 returnUsdcUnits;
        uint256 settledAt;
    }

    mapping(uint256 tokenId => bytes32 proposalHash) public proposalHashOf;
    mapping(uint256 tokenId => uint256 partnershipId) public partnershipIdOf;
    mapping(uint256 tokenId => LotMetadata) public lotMetadata;

    event CertificateMinted(
        uint256 indexed tokenId,
        uint256 indexed partnershipId,
        address indexed to,
        bytes32 proposalHash
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        uint256 yieldQQ,
        uint256 scaScoreTenths,
        uint256 returnUsdcUnits
    );

    constructor(address admin) ERC721("Harvverse Lot Certificate", "HVLOT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(METADATA_UPDATER_ROLE, admin);
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
        _initMetadata(tokenId);
        emit CertificateMinted(tokenId, partnershipId, to, proposalHash);
    }

    function _initMetadata(uint256 tokenId) internal {
        lotMetadata[tokenId] = LotMetadata({
            status: "Active",
            yieldQQ: 0,
            scaScoreTenths: 0,
            returnUsdcUnits: 0,
            settledAt: 0
        });
    }

    function updateMetadata(
        uint256 tokenId,
        uint256 yieldQQ,
        uint256 scaScoreTenths,
        uint256 returnUsdcUnits
    ) external onlyRole(METADATA_UPDATER_ROLE) {
        _requireOwned(tokenId);
        lotMetadata[tokenId] = LotMetadata({
            status: "Settled",
            yieldQQ: yieldQQ,
            scaScoreTenths: scaScoreTenths,
            returnUsdcUnits: returnUsdcUnits,
            settledAt: block.timestamp
        });
        emit MetadataUpdated(tokenId, yieldQQ, scaScoreTenths, returnUsdcUnits);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address previousOwner) {
        previousOwner = _ownerOf(tokenId);
        if (previousOwner != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        LotMetadata memory m = lotMetadata[tokenId];

        string memory statusStr = bytes(m.status).length == 0 ? "Active" : m.status;

        bytes memory header = abi.encodePacked(
            unicode'{"name":"Harvverse Lot ZAF-L02 — Phygital Partnership #',
            Strings.toString(tokenId),
            '","description":"Zafiro Parainema. 1.0 manzana. Comayagua, Honduras. 1,300 msnm. Profile C-Premium. Validated by CoE Honduras 2013 Champion.",',
            '"image":"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop",'
        );

        bytes memory staticAttrs = abi.encodePacked(
            '"attributes":[',
            '{"trait_type":"Lot","value":"HV-HN-ZAF-L02"},',
            '{"trait_type":"Variety","value":"Parainema"},',
            '{"trait_type":"Altitude","value":"1300 msnm"},',
            '{"trait_type":"Profile","value":"C-Premium"},',
            '{"trait_type":"Ticket","value":"$3,425 USDC"},'
        );

        bytes memory dynamicAttrs = abi.encodePacked(
            '{"trait_type":"Status","value":"', statusStr, '"},',
            '{"trait_type":"Yield (qq)","value":"', _renderTenths(m.yieldQQ), '"},',
            '{"trait_type":"SCA Score","value":"', _renderTenths(m.scaScoreTenths), '"},',
            '{"trait_type":"Return USDC","value":"', _renderReturn(m.returnUsdcUnits), '"}',
            "]}"
        );

        bytes memory json = abi.encodePacked(header, staticAttrs, dynamicAttrs);

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
    }

    function _renderTenths(uint256 tenths) internal pure returns (string memory) {
        if (tenths == 0) return "Pending";
        return string(abi.encodePacked(Strings.toString(tenths / 10), ".", Strings.toString(tenths % 10)));
    }

    function _renderReturn(uint256 units) internal pure returns (string memory) {
        if (units == 0) return "Pending";
        return Strings.toString(units / 1e6);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
