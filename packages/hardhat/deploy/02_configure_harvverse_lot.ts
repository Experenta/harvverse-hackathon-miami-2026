import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const configureHarvverseLot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  const farmerWallet = process.env.DEMO_FARMER_WALLET ?? deployer;
  const planHash = process.env.DEMO_PLAN_HASH ?? hre.ethers.id("HVPLAN-ZAF-L02-2026");

  const lotId = 1n;
  const ticketUsdcUnits = 342_500n * 10_000n;

  const factory = await hre.ethers.getContract<Contract>("PartnershipFactory", deployer);

  const gas = await factory.configureLotTerms.estimateGas(lotId, ticketUsdcUnits, farmerWallet, planHash);
  const tx = await factory.configureLotTerms(lotId, ticketUsdcUnits, farmerWallet, planHash, {
    gasLimit: (gas * 120n) / 100n,
  });
  await tx.wait();

  console.log("\nHarvverse lot configured:");
  console.log(`  lotId:           ${lotId}`);
  console.log(`  ticketUsdcUnits: ${ticketUsdcUnits} (= $${Number(ticketUsdcUnits) / 1_000_000})`);
  console.log(`  farmerWallet:    ${farmerWallet}`);
  console.log(`  planHash:        ${planHash}`);
};

export default configureHarvverseLot;

configureHarvverseLot.tags = ["HarvverseLotConfig"];
configureHarvverseLot.dependencies = ["HarvverseCore"];
