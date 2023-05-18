// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deploy", function () {
  it("should success", async function () {
    const [deployer, user1, user2] = await ethers.getSigners();

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
            const name = "PoX太郎";
            const mintCode = "abcdef - Mint by owner";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const txMint = await proofOfX.mintByOwner(exhibitionIndex, name, user1.address, hash);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            console.log(await proofOfX.tokenURI(1));
          });

          it("should false - wrong owner", async function () {
            const name = "PoX太郎";
            const mintCode = "abcdef - Mint by owner 2";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            await expect(proofOfX.connect(user1).mintByOwner(exhibitionIndex, name, user1.address, hash)).to.be.revertedWith(
              "Ownable: caller is not the owner"
            );
          });
        });

        describe("Mint by user", function () {
          it("should success", async function () {
            const name = "PoX太郎";
            const mintCode = "abcdef - Mint by user";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const sig = await deployer.signMessage(ethers.utils.arrayify(hash));
            const txMint = await proofOfX.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, sig);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            console.log(await proofOfX.tokenURI(1));

            await expect(proofOfX.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, sig)).to.be.revertedWith(
              "minted hash"
            );
          });

          it("should false - invalid hash/sig", async function () {
            const name = "PoX太郎";
            const mintCode = "abcdef - Mint by user 2";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const invalidHash = ethers.utils.solidityKeccak256(["string"], ["for invalid sig"]);
            const invalidSig = await deployer.signMessage(ethers.utils.arrayify(invalidHash));
            await expect(proofOfX.connect(user1).mint(exhibitionIndex, name, mintCodeHash, invalidHash, invalidSig)).to.be.revertedWith(
              "invalid hash"
            );
            await expect(proofOfX.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, invalidSig)).to.be.revertedWith(
              "invalid sig"
            );
          });
        });

        describe("Get token attributes", function () {
          it("should success", async function () {
            const name = "PoX太郎 - Get token attributes";
            const mintCode = "abcdef - Get token attributes";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const txMint = await proofOfX.mintByOwner(exhibitionIndex, name, user2.address, hash);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);

            const totalSupply = (await proofOfX.totalSupply()).toNumber();
            let tokenIds = [];
            for (let i = 1; i <= totalSupply; i++) {
              tokenIds.push(i);
            }
            const result = await proofOfX.getTokenAttributes(tokenIds);
            expect(result.length).to.equal(tokenIds.length);
            expect(result[tokenIds.length - 1].name).to.equal(name);
          });
        });
      });
    });
  });
});
