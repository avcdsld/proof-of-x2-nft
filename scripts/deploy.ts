import { ethers } from "hardhat";

async function main() {
  const ProofOfVisit = await ethers.getContractFactory("ProofOfVisit");
  const proofOfVisit = await ProofOfVisit.deploy();
  await proofOfVisit.deployed();
  console.log(`ProofOfVisit deployed to ${proofOfVisit.address}`);

  const imageBaseUrl = "https://ara.mypinata.cloud/ipfs/QmdvFCsYyUdf3W8qS9neWKA3Cc8SZoSpdCnB2ErcLvnBDD/#";
  const imageUrlSuffix = "";
  const dataBaseUrl = "https://ara.mypinata.cloud/ipfs/QmeRPLFySAHpP8neTFqNebyP3afhtmEikxkf678CKKTHUa/";
  const Renderer = await ethers.getContractFactory("Renderer");
  const renderer = await Renderer.deploy(imageBaseUrl, imageUrlSuffix, dataBaseUrl);
  await renderer.deployed();
  console.log(`Renderer deployed to ${renderer.address}`);

  const exhibitionIndex = 1;
  const exhibitionName = "Proof of X";
  const startTime = 1686963600; // 2023-06-17 10:00:00
  const endTime = 1687687200; // 2023-06-25 19:00:00
  const txSetExhibition = await proofOfVisit.setExhibition(exhibitionIndex, exhibitionName, startTime, endTime, renderer.address);
  const txReceipt = await txSetExhibition.wait();
  console.log('txReceipt', txReceipt);

  const name = "Ara";
  const role = "Artist,Staff";
  const mintCode = "code01";
  const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
  const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], ["0xEF4e478F8164a8fB120Ea13c4025D4fBBaA7a378", mintCodeHash]);
  const withPermit = false;
  const txMint = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, "0xEF4e478F8164a8fB120Ea13c4025D4fBBaA7a378", hash, withPermit);
  const txReceipt2 = await txMint.wait();
  console.log('txReceipt2', txReceipt2);

  const mintCode2 = "code02";
  const mintCodeHash2 = ethers.utils.solidityKeccak256(["string"], [mintCode2]);
  const hash2 = ethers.utils.solidityKeccak256(["address", "bytes32"], ["0xEF4e478F8164a8fB120Ea13c4025D4fBBaA7a378", mintCodeHash2]);
  const txMint2 = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, "0xEF4e478F8164a8fB120Ea13c4025D4fBBaA7a378", hash2, withPermit);
  const txReceipt2_2 = await txMint2.wait();
  console.log('txReceipt2_2', txReceipt2_2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
