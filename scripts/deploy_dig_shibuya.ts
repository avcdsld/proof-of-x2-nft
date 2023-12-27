import { ethers } from "hardhat";

async function main() {
  const ProofOfVisit = await ethers.getContractFactory("ProofOfVisit");
  const proofOfVisit = await ProofOfVisit.deploy();
  await proofOfVisit.deployed();
  console.log(`ProofOfVisit deployed to ${proofOfVisit.address}`);

  const imageBaseUrlDigShibuya = "https://ara.mypinata.cloud/ipfs/QmVwswDC89AKBybNUCo6j2yu7kCT9Qn3TuRX4gCqkTQ4fY/";
  const imageUrlSuffixDigShibuya = ".gif";
  const RendererDigShibuya = await ethers.getContractFactory("RendererDigShibuya");
  const renderer = await RendererDigShibuya.deploy(imageBaseUrlDigShibuya, imageUrlSuffixDigShibuya, proofOfVisit.address);
  await renderer.deployed();
  console.log(`RendererDigShibuya deployed to ${renderer.address}`);

  const exhibitionIndex = 2;
  const exhibitionName = "Proof of X - DIG SHIBUYA";
  const startTime = 1704985200; // 2024-01-12 00:00:00
  const endTime = 1705248000; // 2024-01-15 01:00:00
  const txSetExhibition = await proofOfVisit.setExhibition(exhibitionIndex, exhibitionName, startTime, endTime, renderer.address);
  const txReceipt = await txSetExhibition.wait();
  console.log('txReceipt', txReceipt);

  const name = "Ara";
  const role = "Artist,Staff";
  const mintCode = "code01";
  const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
  const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], ["0x115EA29c8020d980bD48056529C341a0932e78aa", mintCodeHash]);
  const withPermit = false;
  const txMint = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, "0x115EA29c8020d980bD48056529C341a0932e78aa", hash, withPermit);
  const txReceipt2 = await txMint.wait();
  console.log('txReceipt2', txReceipt2);

  const mintCode2 = "code02";
  const mintCodeHash2 = ethers.utils.solidityKeccak256(["string"], [mintCode2]);
  const hash2 = ethers.utils.solidityKeccak256(["address", "bytes32"], ["0x115EA29c8020d980bD48056529C341a0932e78aa", mintCodeHash2]);
  const txMint2 = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, "0x115EA29c8020d980bD48056529C341a0932e78aa", hash2, withPermit);
  const txReceipt2_2 = await txMint2.wait();
  console.log('txReceipt2_2', txReceipt2_2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
