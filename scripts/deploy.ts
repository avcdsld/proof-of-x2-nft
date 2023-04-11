import { ethers } from "hardhat";

async function main() {
  const Renderer = await ethers.getContractFactory("Renderer");
  const renderer = await Renderer.deploy();
  await renderer.deployed();
  console.log(`Renderer deployed to ${renderer.address}`);

  const ProofOfX = await ethers.getContractFactory("ProofOfX");
  const proofOfX = await ProofOfX.deploy();
  await proofOfX.deployed();
  console.log(`ProofOfX deployed to ${proofOfX.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
