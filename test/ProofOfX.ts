// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deploy", function () {
  it("should success", async function () {
    const [deployer, user1] = await ethers.getSigners();

    const Renderer = await ethers.getContractFactory("Renderer");
    const renderer = await Renderer.deploy();

    const ProofOfX = await ethers.getContractFactory("ProofOfX");
    const proofOfX = await ProofOfX.deploy();

    describe("Set exhibition", function () {
      it("should success", async function () {
        const currentTimestampInSeconds = Math.round(Date.now() / 1000);
        const exhibitionIndex = 0;
        const exhibitionName = "Proof Of X 2";
        const startTime = currentTimestampInSeconds;
        const endTime = currentTimestampInSeconds + (60 * 60 * 24 * 7);
        const txSetExhibition = await proofOfX.setExhibition(exhibitionIndex, exhibitionName, startTime, endTime, renderer.address);
        const txReceipt = await txSetExhibition.wait();
        expect(await txReceipt.status).to.equal(1);

        describe("Mint by owner", function () {
          it("should success", async function () {
            const minterName = "PoX太郎";
            const txMint = await proofOfX.mintByOwner(exhibitionIndex, minterName, user1.address);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            console.log(await proofOfX.tokenURI(1));
          });

          it("should false - wrong owner", async function () {
            const minterName = "PoX太郎";
            await expect(proofOfX.connect(user1).mintByOwner(exhibitionIndex, minterName, user1.address)).to.be.revertedWith(
              "Ownable: caller is not the owner"
            );
          });
        });

        describe("Mint by user", function () {
          it("should success", async function () {
            const minterName = "PoX太郎";
            const hash = ethers.utils.solidityKeccak256(["address", "uint16", "address"], [user1.address, exhibitionIndex, proofOfX.address])
            const sig = await deployer.signMessage(ethers.utils.arrayify(hash));
            const txMint = await proofOfX.connect(user1).mint(exhibitionIndex, minterName, hash, sig);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            console.log(await proofOfX.tokenURI(1));

            await expect(proofOfX.connect(user1).mint(exhibitionIndex, minterName, hash, sig)).to.be.revertedWith(
              "minted hash"
            );
          });

          it("should false - invalid hash/sig", async function () {
            const minterName = "PoX太郎";
            const hash = ethers.utils.solidityKeccak256(["address", "uint16", "address"], [user1.address, exhibitionIndex, proofOfX.address])
            const invalidHash = ethers.utils.solidityKeccak256(["string"], ["for invalid sig"])
            const invalidSig = await deployer.signMessage(ethers.utils.arrayify(invalidHash));
            await expect(proofOfX.connect(user1).mint(exhibitionIndex, minterName, invalidHash, invalidSig)).to.be.revertedWith(
              "invalid hash"
            );
            await expect(proofOfX.connect(user1).mint(exhibitionIndex, minterName, hash, invalidSig)).to.be.revertedWith(
              "invalid sig"
            );
          });
        });
      });
    });
  });
});
