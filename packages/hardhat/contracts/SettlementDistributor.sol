// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IPartnershipRegistry {
    function partnerOf(uint256 partnershipId) external view returns (address);
    function farmerOf(uint256 partnershipId) external view returns (address);
}

interface ILotCertificate {
    function updateMetadata(
        uint256 tokenId,
        uint256 yieldQQ,
        uint256 scaScoreTenths,
        uint256 returnUsdcUnits
    ) external;
}

contract SettlementDistributor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant SETTLEMENT_OPERATOR_ROLE = keccak256("SETTLEMENT_OPERATOR_ROLE");

    uint256 public constant PARCHMENT_TO_GREEN_TENTHS = 833;
    uint256 public constant FARMER_SHARE_BPS = 6000;
    uint256 public constant BPS = 10_000;
    uint256 public constant YIELD_CAP_Y1_TENTHS = 80;
    uint256 public constant PRICE_FLOOR_CENTS = 250;
    uint256 public constant PRICE_BASE_CENTS = 350; // $3.50/lb fixed (HVPLAN-ZAF-L02-2026)
    uint256 public constant AGRONOMIC_COST_CENTS = 149_000; // $1,490 fixed (HVPLAN-ZAF-L02-2026)

    IERC20 public immutable usdc;
    IPartnershipRegistry public immutable registry;
    ILotCertificate public certificate;

    struct SettlementInput {
        uint256 partnershipId;
        uint256 yieldTenthsQQ;
        bytes32 evidenceHash;
        uint256 scaScoreTenths;
    }

    mapping(uint256 => bool) public settled;

    event SettlementExecuted(
        uint256 indexed partnershipId,
        uint256 revenueCents,
        uint256 profitCents,
        uint256 farmerCents,
        uint256 partnerCents,
        bytes32 evidenceHash,
        uint256 scaScoreTenths
    );

    constructor(address _usdc, address _registry, address admin) {
        usdc = IERC20(_usdc);
        registry = IPartnershipRegistry(_registry);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SETTLEMENT_OPERATOR_ROLE, admin);
    }

    function setCertificate(address _certificate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        certificate = ILotCertificate(_certificate);
    }

    function preview(
        SettlementInput calldata input
    ) public pure returns (uint256 revenueCents, uint256 profitCents, uint256 farmerCents, uint256 partnerCents) {
        uint256 cappedYieldTenths = input.yieldTenthsQQ > YIELD_CAP_Y1_TENTHS
            ? YIELD_CAP_Y1_TENTHS
            : input.yieldTenthsQQ;

        uint256 effectivePrice = PRICE_BASE_CENTS < PRICE_FLOOR_CENTS ? PRICE_FLOOR_CENTS : PRICE_BASE_CENTS;

        revenueCents = (cappedYieldTenths * PARCHMENT_TO_GREEN_TENTHS * effectivePrice) / 100;
        profitCents = revenueCents > AGRONOMIC_COST_CENTS ? revenueCents - AGRONOMIC_COST_CENTS : 0;
        farmerCents = (profitCents * FARMER_SHARE_BPS) / BPS;
        partnerCents = profitCents - farmerCents;
    }

    function settle(SettlementInput calldata input) external onlyRole(SETTLEMENT_OPERATOR_ROLE) nonReentrant {
        require(!settled[input.partnershipId], "SettlementDistributor: already settled");

        address farmer = registry.farmerOf(input.partnershipId);
        address partner = registry.partnerOf(input.partnershipId);
        require(farmer != address(0) && partner != address(0), "SettlementDistributor: bad partnership");

        (uint256 revenueCents, uint256 profitCents, uint256 farmerCents, uint256 partnerCents) = preview(input);

        settled[input.partnershipId] = true;

        if (farmerCents > 0) {
            usdc.safeTransfer(farmer, farmerCents * 10_000);
        }
        if (partnerCents > 0) {
            usdc.safeTransfer(partner, partnerCents * 10_000);
        }

        try
            certificate.updateMetadata(
                input.partnershipId,
                input.yieldTenthsQQ,
                input.scaScoreTenths,
                partnerCents * 10_000
            )
        {} catch {}

        emit SettlementExecuted(
            input.partnershipId,
            revenueCents,
            profitCents,
            farmerCents,
            partnerCents,
            input.evidenceHash,
            input.scaScoreTenths
        );
    }
}
