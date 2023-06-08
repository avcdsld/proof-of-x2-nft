import { ethers } from "hardhat";

async function main() {
  const imageBaseUrl = "https://ara.mypinata.cloud/ipfs/QmdvFCsYyUdf3W8qS9neWKA3Cc8SZoSpdCnB2ErcLvnBDD/#";
  const imageUrlSuffix = "";
  const dataBaseUrl = "https://ara.mypinata.cloud/ipfs/QmTJ525CheYELeiuPiBWTczrEt7bn8ExgqAAHv4HcLzRqn/";
  const Renderer = await ethers.getContractFactory("Renderer");
  const renderer = await Renderer.deploy(imageBaseUrl, imageUrlSuffix, dataBaseUrl);
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
