import { ethers } from "hardhat";

async function main() {
  const ProofOfDonation = await ethers.getContractFactory("ProofOfDonation");
  const proofOfDonation = await ProofOfDonation.deploy();
  await proofOfDonation.deployed();
  console.log(`ProofOfDonation deployed to ${proofOfDonation.address}`);

  const ProofOfDonationRenderer = await ethers.getContractFactory("ProofOfDonationRenderer");
  const renderer = await ProofOfDonationRenderer.deploy();
  await renderer.deployed();
  console.log(`ProofOfDonationRenderer deployed to ${renderer.address}`);

  const tokenId = 1;
  const name = "Noto Earthquake 2024";
  const description = "Proof of Donation #1 by Proof of X project is in support of the January 2024 Noto Peninsula Earthquake in Japan. This is a memento to prove you have made a donation. All donations will be used to support the victims.";
  const image = "https://ara.mypinata.cloud/ipfs/QmNayMJmPnWpb4VeZ6nLT4hh5rMJUAkwboVGCiLVKq3Xkk";
  const artworkCreator = "EXCALIBUR";
  const price = ethers.utils.parseUnits("0.001", "ether");

  const txSetMetadata = await renderer.setMetadata(tokenId, name, description, image, artworkCreator);
  const txSetMetadataReceipt = await txSetMetadata.wait();
  console.log('txSetMetadataReceipt', txSetMetadataReceipt);

  const txSetRenderer = await proofOfDonation.setRenderer(renderer.address);
  const txSetRendererReceipt = await txSetRenderer.wait();
  console.log('txSetRendererReceipt', txSetRendererReceipt);

  const txActivate = await proofOfDonation.activateToken(tokenId, price);
  const txActivateReceipt = await txActivate.wait();
  console.log('txActivateReceipt', txActivateReceipt);

  const quantity = 5;
  const value = price.mul(quantity);
  const message = "Japan - I hope this will help the victims.";
  const remembrance = ethers.utils.solidityKeccak256(["string"], [message]);
  const txMint = await proofOfDonation.donate(tokenId, quantity, remembrance, { value });
  const txMintReceipt= await txMint.wait();
  console.log('txMintReceipt', txMintReceipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
