import type { EvidenceRecord, MilestoneTemplate } from "./types";

export const milestoneTemplates: MilestoneTemplate[] = [
  {
    number: 1,
    label: "Soil & nutrition baseline",
    description: "Soil samples, agronomic plan locked, fertilization schedule signed.",
    evidenceRequired: ["agronomic_plan_pdf", "soil_lab_report"],
  },
  {
    number: 2,
    label: "Flowering & canopy check",
    description: "Visual inspection, flowering density, shade canopy management.",
    evidenceRequired: ["canopy_photos", "agronomist_note"],
  },
  {
    number: 3,
    label: "Pre-harvest yield estimate",
    description: "Cherry density count, projected yield update against plan cap.",
    evidenceRequired: ["density_count", "yield_estimate_doc"],
  },
  {
    number: 4,
    label: "Harvest in progress",
    description: "Cherry intake logs, picking selectivity score, daily lot mass.",
    evidenceRequired: ["intake_logs", "picking_score"],
  },
  {
    number: 5,
    label: "Processing & drying",
    description: "Process method confirmed, fermentation logs, drying curve.",
    evidenceRequired: ["fermentation_log", "drying_curve"],
  },
  {
    number: 6,
    label: "Cup score & lot release",
    description: "SCA score from Q-grader, green analysis, lot identifier signed.",
    evidenceRequired: ["sca_scoresheet", "green_analysis"],
  },
];

const ATTESTER = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720";

export const mockEvidence: EvidenceRecord[] = [
  // ptn_zafiro_003 — awaiting_settlement, all six attested
  ...milestoneTemplates.map<EvidenceRecord>((template, index) => ({
    id: `ev_zafiro_003_m${template.number}`,
    partnershipId: "ptn_zafiro_003",
    milestoneNumber: template.number,
    milestoneLabel: template.label,
    evidenceType: "demo_fixture",
    artifactHash: `0x${(index + 1).toString(16).padStart(2, "0")}aa${"3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f".slice(0, 60)}`,
    registryTxHash: `0x${(index + 1).toString(16).padStart(2, "0")}bb${"4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a".slice(0, 60)}`,
    status: "attested",
    attesterWallet: ATTESTER,
    attesterRole: "verifier",
    notes: `Compressed demo evidence for milestone ${template.number}.`,
    completedAtDemoLabel: `Demo fast-forward · M${template.number} completed`,
    evidenceKeys: template.evidenceRequired,
    demoOnly: true,
    createdAt: Date.now() - 1000 * 60 * 60 * (24 - template.number * 2),
  })),
  // ptn_zafiro_004 — active, M1+M2 recorded, M3 pending
  {
    id: "ev_zafiro_004_m1",
    partnershipId: "ptn_zafiro_004",
    milestoneNumber: 1,
    milestoneLabel: milestoneTemplates[0].label,
    evidenceType: "demo_fixture",
    artifactHash: "0x11cc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    registryTxHash: "0x21dd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    status: "attested",
    attesterWallet: ATTESTER,
    attesterRole: "verifier",
    notes: "Soil baseline locked",
    completedAtDemoLabel: "Demo fast-forward · M1 completed",
    evidenceKeys: milestoneTemplates[0].evidenceRequired,
    demoOnly: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "ev_zafiro_004_m2",
    partnershipId: "ptn_zafiro_004",
    milestoneNumber: 2,
    milestoneLabel: milestoneTemplates[1].label,
    evidenceType: "demo_fixture",
    artifactHash: "0x12cc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    status: "recorded",
    notes: "Pending attestation",
    completedAtDemoLabel: "Demo fast-forward · M2 recorded",
    evidenceKeys: milestoneTemplates[1].evidenceRequired,
    demoOnly: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
  },
];

export const listEvidenceForPartnership = (partnershipId: string) =>
  mockEvidence.filter(record => record.partnershipId === partnershipId);

export const getMilestoneTemplate = (milestoneNumber: number) =>
  milestoneTemplates.find(template => template.number === milestoneNumber);

export const buildMilestoneRows = (partnershipId: string) =>
  milestoneTemplates.map(template => {
    const record = mockEvidence.find(r => r.partnershipId === partnershipId && r.milestoneNumber === template.number);
    return {
      template,
      record,
    };
  });
