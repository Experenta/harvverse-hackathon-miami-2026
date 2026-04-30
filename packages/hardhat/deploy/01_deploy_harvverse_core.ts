import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployHarvverseCore: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const usdc = await deploy("MockUSDC", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  const certificate = await deploy("LotCertificate", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  const factory = await deploy("PartnershipFactory", {
    from: deployer,
    args: [usdc.address, certificate.address, deployer, deployer],
    log: true,
    autoMine: true,
  });

  const distributor = await deploy("SettlementDistributor", {
    from: deployer,
    args: [usdc.address, factory.address, deployer],
    log: true,
    autoMine: true,
  });

  const evidence = await deploy("EvidenceRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  const lotCertificate = await hre.ethers.getContract<Contract>("LotCertificate", deployer);
  const minterRole = await lotCertificate.MINTER_ROLE();

  const grantGas = await lotCertificate.grantRole.estimateGas(minterRole, factory.address);
  const grantTx = await lotCertificate.grantRole(minterRole, factory.address, {
    gasLimit: (grantGas * 120n) / 100n,
  });
  await grantTx.wait();

  const distributorContract = await hre.ethers.getContract<Contract>("SettlementDistributor", deployer);
  const setCertTx = await distributorContract.setCertificate(certificate.address);
  await setCertTx.wait();

  const metadataRole = await lotCertificate.METADATA_UPDATER_ROLE();
  const grantMetaGas = await lotCertificate.grantRole.estimateGas(metadataRole, distributor.address);
  const grantMetaTx = await lotCertificate.grantRole(metadataRole, distributor.address, {
    gasLimit: (grantMetaGas * 120n) / 100n,
  });
  await grantMetaTx.wait();

  console.log("\nHarvverse core deployed:");
  console.log(`  MockUSDC:              ${usdc.address}`);
  console.log(`  LotCertificate:        ${certificate.address}`);
  console.log(`  PartnershipFactory:    ${factory.address}`);
  console.log(`  SettlementDistributor: ${distributor.address}`);
  console.log(`  EvidenceRegistry:      ${evidence.address}`);
  console.log(`  Granted MINTER_ROLE on LotCertificate to PartnershipFactory (${factory.address})`);
  console.log(`  Set certificate address on SettlementDistributor (${certificate.address})`);
  console.log(`  Granted METADATA_UPDATER_ROLE on LotCertificate to SettlementDistributor (${distributor.address})`);
};

export default deployHarvverseCore;

deployHarvverseCore.tags = ["HarvverseCore"];
