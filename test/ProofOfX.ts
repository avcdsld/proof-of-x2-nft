// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofOfX", function () {
  it("Should be able to mint", async function () {
    const [deployer, user1] = await ethers.getSigners();

    const Renderer = await ethers.getContractFactory("Renderer");
    const renderer = await Renderer.deploy();

    const ProofOfX = await ethers.getContractFactory("ProofOfX");
    const proofOfX = await ProofOfX.deploy();

    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const exhibitionIndex = 0;
    const exhibitionName = "Proof Of X 2";
    const startTime = currentTimestampInSeconds;
    const endTime = currentTimestampInSeconds + (60 * 60 * 24 * 7);
    const txSetExhibition = await proofOfX.setExhibition(
      exhibitionIndex,
      exhibitionName,
      startTime,
      endTime,
      renderer.address,
    );
    await txSetExhibition.wait();

    const minterName = "PoX太郎";
    const txMint = await proofOfX.mintByOwner(
      exhibitionIndex,
      minterName,
      user1.address,
    );
    await txMint.wait();
    expect(await proofOfX.balanceOf(user1.address)).to.equal(1);
    console.log(await proofOfX.tokenURI(1))

    await expect(proofOfX.connect(user1).mintByOwner(exhibitionIndex, minterName, user1.address)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });
});
