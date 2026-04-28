// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ILotCertificate {
    function mintCertificate(address to, uint256 partnershipId, bytes32 proposalHash) external returns (uint256);
}

contract PartnershipFactory is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant CONFIGURATOR_ROLE = keccak256("CONFIGURATOR_ROLE");

    IERC20 public immutable usdc;
    ILotCertificate public immutable certificate;
    address public immutable escrowWallet;

    struct LotTerms {
        bool active;
        uint256 ticketUsdcUnits;
        address farmerWallet;
        bytes32 planHash;
    }

    uint256 public nextPartnershipId = 1;
    mapping(uint256 => LotTerms) public lotTerms;
    mapping(bytes32 => bool) public openedProposalHashes;
    mapping(uint256 => address) public partnerOf;
    mapping(uint256 => address) public farmerOf;

    event LotTermsConfigured(uint256 indexed lotId, uint256 ticketUsdcUnits, address farmerWallet, bytes32 planHash);
    event PartnershipOpened(
        uint256 indexed partnershipId,
        uint256 indexed lotId,
        address indexed partner,
        uint256 ticketUsdcUnits,
        bytes32 proposalHash
    );

    constructor(IERC20 _usdc, ILotCertificate _certificate, address _escrowWallet, address admin) {
        require(_escrowWallet != address(0), "PartnershipFactory: escrow zero");
        usdc = _usdc;
        certificate = _certificate;
        escrowWallet = _escrowWallet;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CONFIGURATOR_ROLE, admin);
    }

    function configureLotTerms(
        uint256 lotId,
        uint256 ticketUsdcUnits,
        address farmerWallet,
        bytes32 planHash
    ) external onlyRole(CONFIGURATOR_ROLE) {
        require(ticketUsdcUnits > 0, "PartnershipFactory: ticket zero");
        require(farmerWallet != address(0), "PartnershipFactory: farmer zero");
        require(planHash != bytes32(0), "plan hash required");

        lotTerms[lotId] = LotTerms({
            active: true,
            ticketUsdcUnits: ticketUsdcUnits,
            farmerWallet: farmerWallet,
            planHash: planHash
        });

        emit LotTermsConfigured(lotId, ticketUsdcUnits, farmerWallet, planHash);
    }

    function expectedProposalHash(uint256 lotId, address partner) public view returns (bytes32) {
        LotTerms memory terms = lotTerms[lotId];
        require(terms.active, "PartnershipFactory: lot inactive");
        return
            keccak256(
                abi.encode(
                    block.chainid,
                    address(this),
                    lotId,
                    partner,
                    terms.ticketUsdcUnits,
                    terms.farmerWallet,
                    terms.planHash
                )
            );
    }

    function openPartnership(
        uint256 lotId,
        bytes32 proposalHash
    ) external nonReentrant returns (uint256 partnershipId) {
        LotTerms memory terms = lotTerms[lotId];
        require(terms.active, "PartnershipFactory: lot inactive");
        require(proposalHash != bytes32(0), "PartnershipFactory: hash zero");
        require(proposalHash == expectedProposalHash(lotId, msg.sender), "PartnershipFactory: hash mismatch");
        require(!openedProposalHashes[proposalHash], "PartnershipFactory: hash used");

        openedProposalHashes[proposalHash] = true;
        partnershipId = nextPartnershipId++;
        partnerOf[partnershipId] = msg.sender;
        farmerOf[partnershipId] = terms.farmerWallet;

        usdc.safeTransferFrom(msg.sender, escrowWallet, terms.ticketUsdcUnits);
        certificate.mintCertificate(msg.sender, partnershipId, proposalHash);

        emit PartnershipOpened(partnershipId, lotId, msg.sender, terms.ticketUsdcUnits, proposalHash);
    }
}
