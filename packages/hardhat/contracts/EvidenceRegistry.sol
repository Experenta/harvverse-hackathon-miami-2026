// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract EvidenceRegistry is AccessControl {
    bytes32 public constant ATTESTER_ROLE = keccak256("ATTESTER_ROLE");

    event EvidenceAttested(
        bytes32 indexed evidenceHash,
        uint256 indexed subjectId,
        uint256 indexed milestoneNumber,
        address attester,
        string schemaName
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ATTESTER_ROLE, admin);
    }

    function attestEvidence(
        bytes32 evidenceHash,
        uint256 subjectId,
        uint256 milestoneNumber,
        string calldata schemaName
    ) external onlyRole(ATTESTER_ROLE) {
        require(evidenceHash != bytes32(0), "EvidenceRegistry: empty hash");
        emit EvidenceAttested(evidenceHash, subjectId, milestoneNumber, msg.sender, schemaName);
    }
}
