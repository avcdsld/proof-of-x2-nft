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
  const name = "NAMAZU-E by EXCALIBUR";
  const description = `Proof of Donation #1 by Proof of X project, a tangible expression of support for the victims of the January 2024 Noto Peninsula Earthquake in Japan. This proof of donation serves as a memento, attesting that you've contributed to the cause. Every donation will be dedicated to aiding those affected.\\n\\nDelving into Japanese folklore, and you'll encounter Namazu, a mythical catfish believed to trigger earthquakes through its tumultuous movements in underground rivers. This age-old tale weaves a narrative that connects natural phenomena with mythical beings, offering an explanation for seismic activities.\\n\\nIn one captivating story, the god Kashima takes center stage, using a colossal stone to subdue Namazu and prevent earthquakes. However, when Kashima lowers his guard, Namazu slips away, setting off tremors. This narrative captures the delicate equilibrium thought to exist between gods and mythical creatures, controlling the forces of nature. \\n\\nThrough the process of minting this NAMAZU-E, which is a NAMAZU art,  on-chain, our project unfolds with the purpose of channeling our thoughts and emotions towards the reconstruction efforts. Additionally, transparent records of donors will be maintained, ensuring a clear and accountable journey towards supporting those in need. The donation will be delivered to Sekijuji.`;
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
