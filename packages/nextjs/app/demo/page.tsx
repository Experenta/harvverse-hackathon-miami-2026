"use client";

import { useMemo, useState } from "react";
import { keccak256, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

/* eslint-disable @typescript-eslint/no-unused-vars */

const CHAIN_ID = 11142220 as const;
const contracts = deployedContracts[CHAIN_ID];

const HARDHAT_ACCOUNT_2 = "0x2078f502C81D3467F56041b394b1dFcDe60D7192" as const;
const LOT_ID = 4n;
const TICKET_AMOUNT_USDC = 3425000000n;
const YIELD_TENTHS_QQ = 60n;
const PRICE_CENTS_PER_LB = 350n;
const AGRONOMIC_COST_CENTS = 149000n;
const MILESTONE_NUMBER = 6n;
const SCHEMA_NAME = "HarvverseMilestoneEvidence";
const SCA_SCORE_TENTHS = 0n;
const SETTLEMENT_FUND_AMOUNT = 259_300_000n;

const PLAN_HASH = keccak256(toHex("HVPLAN-ZAF-L02-2026"));
const EVIDENCE_HASH = keccak256(toHex("HARVEST-ZAF-L02-2026"));

const MILESTONE_HASHES = [
  keccak256(toHex("HARVEST-ZAF-L02-M1-DIAGNOSTICO")),
  keccak256(toHex("HARVEST-ZAF-L02-M2-PREPARACION")),
  keccak256(toHex("HARVEST-ZAF-L02-M3-NUTRICION-BASE")),
  keccak256(toHex("HARVEST-ZAF-L02-M4-MANTENIMIENTO")),
  keccak256(toHex("HARVEST-ZAF-L02-M5-NUTRICION-REFUERZO")),
  keccak256(toHex("HARVEST-ZAF-L02-M6-COSECHA")),
] as const;

const MILESTONE_NUMBERS = [1n, 2n, 3n, 4n, 5n, 6n] as const;

const EXPECTED = {
  revenueDollars: "1,749.30",
  profitDollars: "259.30",
  farmerDollars: "155.58",
  partnerDollars: "103.72",
  revenueCents: 174930n,
  profitCents: 25930n,
  farmerCents: 15558n,
  partnerCents: 10372n,
};

type StepStatus = "pending" | "current" | "complete" | "failed";

type Step = {
  id: number;
  title: string;
  description: string;
  actor: "Admin (Account 1)" | "Maria (Account 2)" | "Anyone";
  expectedSigner?: `0x${string}`;
  isRead?: boolean;
  inputs: { label: string; value: string }[];
};

const STEPS: Step[] = [
  {
    id: 1,
    title: "Mint MockUSDC to Maria",
    description: "Minting $3,425 hvUSDC to Maria's wallet",
    actor: "Admin (Account 1)",
    inputs: [
      { label: "to", value: HARDHAT_ACCOUNT_2 },
      { label: "amount", value: `${TICKET_AMOUNT_USDC.toString()} (= $3,425.00)` },
    ],
  },
  {
    id: 2,
    title: "Configure Lot Terms",
    description: "Setting up lot ZAF-L02 terms on-chain",
    actor: "Admin (Account 1)",
    inputs: [
      { label: "lotId", value: LOT_ID.toString() },
      { label: "ticketUsdcUnits", value: TICKET_AMOUNT_USDC.toString() },
      { label: "farmerWallet", value: "<connected admin>" },
      { label: "planHash", value: PLAN_HASH },
    ],
  },
  {
    id: 3,
    title: "Maria Approves USDC Spend",
    description: "Maria authorizing $3,425 spend to PartnershipFactory",
    actor: "Maria (Account 2)",
    expectedSigner: HARDHAT_ACCOUNT_2,
    inputs: [
      { label: "spender", value: contracts.PartnershipFactory.address },
      { label: "amount", value: TICKET_AMOUNT_USDC.toString() },
    ],
  },
  {
    id: 4,
    title: "Maria Opens Partnership",
    description: "Maria signing the partnership and transferring funds to escrow",
    actor: "Maria (Account 2)",
    expectedSigner: HARDHAT_ACCOUNT_2,
    inputs: [
      { label: "lotId", value: LOT_ID.toString() },
      { label: "proposalHash", value: "<read from expectedProposalHash>" },
    ],
  },
  {
    id: 5,
    title: "Attest All 6 Milestones",
    description:
      "Admin attests the full agronomic cycle in a single transaction — Diagnóstico, Preparación, Nutrición Base, Mantenimiento, Nutrición Refuerzo, and Cosecha — compressing 10 months into one block.",
    actor: "Admin (Account 1)",
    inputs: [
      { label: "milestones", value: "M1 Diagnóstico → M6 Cosecha (6 events)" },
      { label: "subjectId", value: "1 (partnershipId)" },
      { label: "schema", value: "HarvverseMilestoneEvidence" },
    ],
  },
  {
    id: 6,
    title: "Fund Settlement Pool",
    description: "Admin transfers exact payout amount to SettlementDistributor so it can pay out farmer and partner.",
    actor: "Admin (Account 1)",
    inputs: [
      { label: "to", value: contracts.SettlementDistributor.address },
      { label: "amount", value: "260000000 (= $260.00 — farmer $156 + partner $104)" },
    ],
  },
  {
    id: 7,
    title: "Preview Settlement",
    description: "Read-only preview of settlement math (no gas).",
    actor: "Anyone",
    isRead: true,
    inputs: [
      { label: "partnershipId", value: LOT_ID.toString() },
      { label: "yieldTenthsQQ", value: `${YIELD_TENTHS_QQ.toString()} (6.0 qq)` },
      { label: "priceCentsPerLb", value: `${PRICE_CENTS_PER_LB.toString()} ($3.50)` },
      { label: "agronomicCostCents", value: `${AGRONOMIC_COST_CENTS.toString()} ($1,490)` },
      { label: "evidenceHash", value: EVIDENCE_HASH },
    ],
  },
  {
    id: 8,
    title: "Execute Settlement",
    description: "Distributing USDC to both wallets in one transaction",
    actor: "Admin (Account 1)",
    inputs: [
      { label: "partnershipId", value: LOT_ID.toString() },
      { label: "yieldTenthsQQ", value: YIELD_TENTHS_QQ.toString() },
      { label: "priceCentsPerLb", value: PRICE_CENTS_PER_LB.toString() },
      { label: "agronomicCostCents", value: AGRONOMIC_COST_CENTS.toString() },
      { label: "evidenceHash", value: EVIDENCE_HASH },
    ],
  },
];

const formatCentsAsDollars = (cents: bigint) => {
  const dollars = cents / 100n;
  const remainder = cents % 100n;
  return `$${dollars.toLocaleString("en-US")}.${remainder.toString().padStart(2, "0")}`;
};

const formatUsdcUnitsAsDollars = (units: bigint) => {
  const dollars = units / 1_000_000n;
  const remainder = units % 1_000_000n;
  const cents = (remainder / 10_000n).toString().padStart(2, "0");
  return `$${dollars.toLocaleString("en-US")}.${cents}`;
};

const truncateHash = (hash?: string) => (hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : "");

const StatusIcon = ({ status }: { status: StepStatus }) => {
  if (status === "complete") return <span className="text-green-500">✅</span>;
  if (status === "current") return <span className="text-blue-500">⏳</span>;
  if (status === "failed") return <span className="text-red-500">❌</span>;
  return <span className="text-gray-400">○</span>;
};

const DemoPage = () => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient({ chainId: 11142220 });
  const { writeContractAsync, isPending: writePending } = useWriteContract();

  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(() =>
    STEPS.map((_, i) => (i === 0 ? "current" : "pending")),
  );
  const [activeStep, setActiveStep] = useState(0);
  const [txHashes, setTxHashes] = useState<(string | undefined)[]>(() => STEPS.map(() => undefined));
  const [errors, setErrors] = useState<(string | undefined)[]>(() => STEPS.map(() => undefined));
  const [proposalHash, setProposalHash] = useState<`0x${string}` | undefined>();
  const [certificateTokenId, setCertificateTokenId] = useState<bigint | undefined>();
  const [previewResult, setPreviewResult] = useState<
    | {
        revenueCents: bigint;
        profitCents: bigint;
        farmerCents: bigint;
        partnerCents: bigint;
      }
    | undefined
  >();
  const [previewBusy, setPreviewBusy] = useState(false);
  const [adminBalance, setAdminBalance] = useState<bigint | undefined>();
  const [mariaBalance, setMariaBalance] = useState<bigint | undefined>();
  const [submitBusy, setSubmitBusy] = useState(false);

  const step = STEPS[activeStep];
  const expectedSigner = step?.expectedSigner;
  const wrongSigner =
    !!expectedSigner && !!connectedAddress && expectedSigner.toLowerCase() !== connectedAddress.toLowerCase();
  const switchBackToAdmin =
    activeStep > 0 &&
    (activeStep === 4 || activeStep === 6) &&
    !!connectedAddress &&
    connectedAddress.toLowerCase() === HARDHAT_ACCOUNT_2.toLowerCase();

  const refreshBalances = async () => {
    if (!publicClient || !connectedAddress) return;
    try {
      const [admin, maria] = await Promise.all([
        publicClient.readContract({
          address: contracts.MockUSDC.address,
          abi: contracts.MockUSDC.abi,
          functionName: "balanceOf",
          args: [connectedAddress],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: contracts.MockUSDC.address,
          abi: contracts.MockUSDC.abi,
          functionName: "balanceOf",
          args: [HARDHAT_ACCOUNT_2],
        }) as Promise<bigint>,
      ]);
      setAdminBalance(admin);
      setMariaBalance(maria);
    } catch {
      // ignore
    }
  };

  const recordError = (idx: number, message: string) => {
    setErrors(prev => {
      const next = [...prev];
      next[idx] = message;
      return next;
    });
    setStepStatuses(prev => {
      const next = [...prev];
      next[idx] = "failed";
      return next;
    });
  };

  const clearError = (idx: number) => {
    setErrors(prev => {
      const next = [...prev];
      next[idx] = undefined;
      return next;
    });
  };

  const submit = async (idx: number, fn: () => Promise<`0x${string}`>) => {
    clearError(idx);
    if (!publicClient) {
      recordError(idx, "Public client unavailable");
      return;
    }
    setSubmitBusy(true);
    try {
      const hash = await fn();
      setTxHashes(prev => {
        const next = [...prev];
        next[idx] = hash;
        return next;
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
        timeout: 120_000,
      });

      if (receipt.status === "success") {
        setStepStatuses(prev => {
          const next = [...prev];
          next[idx] = "complete";
          if (idx + 1 < STEPS.length) next[idx + 1] = "current";
          return next;
        });
        if (idx + 1 < STEPS.length) {
          setActiveStep(idx + 1);
        }

        if (idx === 3) {
          try {
            const next = (await publicClient.readContract({
              address: contracts.PartnershipFactory.address,
              abi: contracts.PartnershipFactory.abi,
              functionName: "nextPartnershipId",
            })) as bigint;
            const tokenId = next - 1n;
            if (tokenId > 0n) setCertificateTokenId(tokenId);
          } catch {
            // ignore
          }
        }

        if (idx === 7) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          await refreshBalances();
        }
      } else {
        setStepStatuses(prev => {
          const next = [...prev];
          next[idx] = "failed";
          return next;
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      recordError(idx, message);
    } finally {
      setSubmitBusy(false);
    }
  };

  const handleStep1 = () =>
    submit(0, () =>
      writeContractAsync({
        address: contracts.MockUSDC.address,
        abi: contracts.MockUSDC.abi,
        functionName: "mint",
        args: [HARDHAT_ACCOUNT_2, TICKET_AMOUNT_USDC],
      }),
    );

  const handleStep2 = () => {
    if (!connectedAddress) return;
    return submit(1, () =>
      writeContractAsync({
        address: contracts.PartnershipFactory.address,
        abi: contracts.PartnershipFactory.abi,
        functionName: "configureLotTerms",
        args: [LOT_ID, TICKET_AMOUNT_USDC, connectedAddress, PLAN_HASH],
      }),
    );
  };

  const handleStep3 = () =>
    submit(2, () =>
      writeContractAsync({
        address: contracts.MockUSDC.address,
        abi: contracts.MockUSDC.abi,
        functionName: "approve",
        args: [contracts.PartnershipFactory.address, TICKET_AMOUNT_USDC],
      }),
    );

  const handleStep4 = async () => {
    if (!publicClient) return;
    clearError(3);
    try {
      const hash = (await publicClient.readContract({
        address: contracts.PartnershipFactory.address,
        abi: contracts.PartnershipFactory.abi,
        functionName: "expectedProposalHash",
        args: [LOT_ID, HARDHAT_ACCOUNT_2],
      })) as `0x${string}`;
      setProposalHash(hash);

      const [balance, allowance, hashUsed] = (await Promise.all([
        publicClient.readContract({
          address: contracts.MockUSDC.address,
          abi: contracts.MockUSDC.abi,
          functionName: "balanceOf",
          args: [HARDHAT_ACCOUNT_2],
        }),
        publicClient.readContract({
          address: contracts.MockUSDC.address,
          abi: contracts.MockUSDC.abi,
          functionName: "allowance",
          args: [HARDHAT_ACCOUNT_2, contracts.PartnershipFactory.address],
        }),
        publicClient.readContract({
          address: contracts.PartnershipFactory.address,
          abi: contracts.PartnershipFactory.abi,
          functionName: "openedProposalHashes",
          args: [hash],
        }),
      ])) as [bigint, bigint, boolean];

      if (balance < TICKET_AMOUNT_USDC) {
        recordError(3, "Maria has 0 USDC — run Step 1 first to mint.");
        return;
      }
      if (allowance < TICKET_AMOUNT_USDC) {
        recordError(3, "Maria has not approved the spend — run Step 3 first.");
        return;
      }
      if (hashUsed) {
        recordError(3, "This partnership was already opened. Restart the hardhat node and run from Step 1.");
        return;
      }

      await submit(3, () =>
        writeContractAsync({
          address: contracts.PartnershipFactory.address,
          abi: contracts.PartnershipFactory.abi,
          functionName: "openPartnership",
          args: [LOT_ID, hash],
        }),
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      recordError(3, message);
    }
  };

  const handleStep5 = () =>
    submit(4, () =>
      writeContractAsync({
        address: contracts.EvidenceRegistry.address,
        abi: contracts.EvidenceRegistry.abi,
        functionName: "batchAttestEvidence",
        args: [MILESTONE_HASHES, LOT_ID, MILESTONE_NUMBERS, "HarvverseMilestoneEvidence"],
      }),
    );

  const handleStep6 = () =>
    submit(5, () =>
      writeContractAsync({
        address: contracts.MockUSDC.address,
        abi: contracts.MockUSDC.abi,
        functionName: "transfer",
        args: [contracts.SettlementDistributor.address, SETTLEMENT_FUND_AMOUNT],
      }),
    );

  const handleStep7 = async () => {
    if (!publicClient) return;
    clearError(6);
    setPreviewBusy(true);
    try {
      const result = (await publicClient.readContract({
        address: contracts.SettlementDistributor.address,
        abi: contracts.SettlementDistributor.abi,
        functionName: "preview",
        args: [
          {
            partnershipId: LOT_ID,
            yieldTenthsQQ: YIELD_TENTHS_QQ,
            evidenceHash: EVIDENCE_HASH,
            scaScoreTenths: SCA_SCORE_TENTHS,
          },
        ],
      })) as readonly [bigint, bigint, bigint, bigint];
      setPreviewResult({
        revenueCents: result[0],
        profitCents: result[1],
        farmerCents: result[2],
        partnerCents: result[3],
      });
      setStepStatuses(prev => {
        const next = [...prev];
        next[6] = "complete";
        if (next.length > 7) next[7] = "current";
        return next;
      });
      setActiveStep(7);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      recordError(6, message);
    } finally {
      setPreviewBusy(false);
    }
  };

  const handleStep8 = () =>
    submit(7, () =>
      writeContractAsync({
        address: contracts.SettlementDistributor.address,
        abi: contracts.SettlementDistributor.abi,
        functionName: "settle",
        args: [
          {
            partnershipId: LOT_ID,
            yieldTenthsQQ: YIELD_TENTHS_QQ,
            evidenceHash: EVIDENCE_HASH,
            scaScoreTenths: SCA_SCORE_TENTHS,
          },
        ],
      }),
    );

  const handlers = [
    handleStep1,
    handleStep2,
    handleStep3,
    handleStep4,
    handleStep5,
    handleStep6,
    handleStep7,
    handleStep8,
  ];

  const previewMatchesExpected = useMemo(() => {
    if (!previewResult) return false;
    return (
      previewResult.revenueCents === EXPECTED.revenueCents &&
      previewResult.profitCents === EXPECTED.profitCents &&
      previewResult.farmerCents === EXPECTED.farmerCents &&
      previewResult.partnerCents === EXPECTED.partnerCents
    );
  }, [previewResult]);

  const isCurrent = stepStatuses[activeStep] === "current";
  const buttonDisabled =
    !isCurrent || writePending || submitBusy || previewBusy || (step.id !== 7 && !connectedAddress);

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Harvverse Demo Flow</h1>
          <p className="text-sm opacity-70">
            7-step simulation of the full Harvverse partnership lifecycle on the local Hardhat chain.
          </p>
          <p className="mt-2 text-xs opacity-60">
            Connected: <span className="font-mono">{connectedAddress ?? "(not connected)"}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: step list */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-base-300 bg-base-100 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">Steps</h2>
              <ul className="space-y-2">
                {STEPS.map((s, i) => {
                  const status = stepStatuses[i];
                  const isActive = i === activeStep;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setActiveStep(i)}
                        className={`flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors ${
                          isActive ? "bg-base-200" : "hover:bg-base-200/60"
                        }`}
                      >
                        <span className="mt-0.5 text-lg leading-none">
                          <StatusIcon status={status} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium">
                            {s.id}. {s.title}
                          </span>
                          <span className="block text-xs opacity-60">{s.actor}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right column: step detail */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-base-300 bg-base-100 p-6">
              <div className="mb-4 flex items-center gap-3">
                <StatusIcon status={stepStatuses[activeStep]} />
                <h2 className="text-xl font-semibold">
                  Step {step.id}: {step.title}
                </h2>
              </div>
              <p className="mb-4 text-sm opacity-80">{step.description}</p>

              <div className="mb-4 text-xs">
                <span className="rounded-full bg-base-200 px-2 py-1 font-medium">{step.actor}</span>
                {step.isRead && (
                  <span className="ml-2 rounded-full bg-base-200 px-2 py-1 font-medium">Read-only · no gas</span>
                )}
              </div>

              {wrongSigner && (
                <div className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-900">
                  <strong>⚠ Switch wallet:</strong> This step must be signed by Maria (Account 2 —{" "}
                  <span className="font-mono">{HARDHAT_ACCOUNT_2}</span>). Your connected wallet is{" "}
                  <span className="font-mono">{connectedAddress}</span>.
                </div>
              )}
              {switchBackToAdmin && (
                <div className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-900">
                  <strong>⚠ Switch wallet:</strong> This step must be signed by the Admin (Account 1). Your connected
                  wallet is currently Maria.
                </div>
              )}

              <div className="mb-4 rounded-md bg-base-200 p-3">
                <div className="mb-2 text-xs font-semibold uppercase opacity-60">Pre-filled inputs</div>
                <dl className="grid grid-cols-1 gap-1 text-xs">
                  {step.inputs.map(input => (
                    <div key={input.label} className="flex flex-col sm:flex-row sm:gap-2">
                      <dt className="w-48 font-mono opacity-60">{input.label}</dt>
                      <dd className="font-mono break-all opacity-80">{input.value}</dd>
                    </div>
                  ))}
                  {step.id === 4 && proposalHash && (
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      <dt className="w-48 font-mono opacity-60">resolved proposalHash</dt>
                      <dd className="font-mono break-all opacity-80">{proposalHash}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Step 4 result: certificate token ID */}
              {step.id === 4 && certificateTokenId !== undefined && (
                <div className="mb-4 rounded-md border border-green-400 bg-green-50 p-3 text-sm text-green-900">
                  <strong>Certificate minted:</strong> LotCertificate token ID #{certificateTokenId.toString()}
                </div>
              )}

              {/* Step 7 preview result */}
              {step.id === 7 && previewResult && (
                <div className="mb-4 rounded-md border border-base-300 bg-base-200 p-3 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    Preview result
                    {previewMatchesExpected && <span className="text-green-600">✅ matches expected</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
                    <div>Revenue</div>
                    <div>
                      {formatCentsAsDollars(previewResult.revenueCents)}{" "}
                      <span className="opacity-50">/ expected ${EXPECTED.revenueDollars}</span>
                    </div>
                    <div>Profit</div>
                    <div>
                      {formatCentsAsDollars(previewResult.profitCents)}{" "}
                      <span className="opacity-50">/ expected ${EXPECTED.profitDollars}</span>
                    </div>
                    <div>Farmer share (60%)</div>
                    <div>
                      {formatCentsAsDollars(previewResult.farmerCents)}{" "}
                      <span className="opacity-50">/ expected ${EXPECTED.farmerDollars}</span>
                    </div>
                    <div>Partner share (40%)</div>
                    <div>
                      {formatCentsAsDollars(previewResult.partnerCents)}{" "}
                      <span className="opacity-50">/ expected ${EXPECTED.partnerDollars}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8 balances after settlement */}
              {step.id === 8 && (adminBalance !== undefined || mariaBalance !== undefined) && (
                <div className="mb-4 rounded-md border border-green-400 bg-green-50 p-3 text-sm text-green-900">
                  <div className="mb-1 font-semibold">Final hvUSDC balances</div>
                  <div className="grid grid-cols-1 gap-1 font-mono text-xs">
                    <div>
                      Admin (farmer): {adminBalance !== undefined ? formatUsdcUnitsAsDollars(adminBalance) : "—"}
                    </div>
                    <div>
                      Maria (partner): {mariaBalance !== undefined ? formatUsdcUnitsAsDollars(mariaBalance) : "—"}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => handlers[activeStep]()}
                disabled={buttonDisabled}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {writePending || submitBusy
                  ? "Pending…"
                  : previewBusy
                    ? "Reading…"
                    : step.isRead
                      ? "Run preview"
                      : `Execute step ${step.id}`}
              </button>

              {txHashes[activeStep] && (
                <div className="mt-3 text-xs">
                  <span className="opacity-60">Tx hash: </span>
                  <a
                    href={`/blockexplorer/transaction/${txHashes[activeStep]}`}
                    className="font-mono text-blue-600 underline"
                  >
                    {truncateHash(txHashes[activeStep])}
                  </a>
                </div>
              )}

              {errors[activeStep] && (
                <div className="mt-3 rounded-md border border-red-400 bg-red-50 p-3 text-xs text-red-800">
                  <strong>Error:</strong> {errors[activeStep]}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
