import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deploy - Proof of Donation", function () {
  it("should success", async function () {
    const [deployer, user1, user2] = await ethers.getSigners();

    const ProofOfDonation = await ethers.getContractFactory("ProofOfDonation");
    const proofOfDonation = await ProofOfDonation.deploy();

    const imageUrl = "https://ara.mypinata.cloud/ipfs/QmNayMJmPnWpb4VeZ6nLT4hh5rMJUAkwboVGCiLVKq3Xkk";
    const animationUrl = imageUrl;
    const artworkCreator = "EXCALIBUR";
    const minimumAmount = ethers.utils.parseUnits("0.001", "ether");

    describe("Set donation", function () {
      it("should success", async function () {
        const currentTimestampInSeconds = Math.round(Date.now() / 1000);
        const donationIndex = 1;
        const donationName = "2024 Noto Earthquake";
        const description = "2024 Noto Earthquake";
        const baseExternalUrl = "https://pox.exhibit.website/#";
        const rendererAddress = "0x0000000000000000000000000000000000000000";
        const active = true;
        const createdAt = currentTimestampInSeconds;
        const txSetDonation = await proofOfDonation.setDonation(
          donationIndex,
          donationName,
          description,
          baseExternalUrl,
          imageUrl,
          animationUrl,
          artworkCreator,
          rendererAddress,
          minimumAmount,
          createdAt,
          active,
        );
        const txReceipt = await txSetDonation.wait();
        expect(await txReceipt.status).to.equal(1);

        describe("Mint by owner", function () {
          it("should success", async function () {
            const name = "\"PoX太郎\"";
            const txMint = await proofOfDonation.mintByOwner(donationIndex, name, user1.address);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            const tokenId = txReceipt.events![0].args!.tokenId;
            console.log(await proofOfDonation.tokenURI(tokenId));
          });

          it("should false - wrong owner", async function () {
            const name = "PoX太郎";
            await expect(proofOfDonation.connect(user1).mintByOwner(donationIndex, name, user1.address)).to.be.revertedWithCustomError(
              proofOfDonation,
              "OwnableUnauthorizedAccount"
            );
          });
        });

        describe("Donate", function () {
          it("should success", async function () {
            const name = "PoX太郎";
            const value = ethers.utils.parseUnits("0.01", "ether");
            const txDonate = await proofOfDonation.connect(user1).donate(donationIndex, name, user1.address, { value });
            const txDonateReceipt = await txDonate.wait();
            expect(await txDonateReceipt.status).to.equal(1);
          });

          it("should success 2", async function () {
            const name = "PoX太郎";
            const value = ethers.utils.parseUnits("0.01", "ether");
            const txDonate = await proofOfDonation.connect(user1).donate(donationIndex, name, user2.address, { value });
            const txDonateReceipt = await txDonate.wait();
            expect(await txDonateReceipt.status).to.equal(1);
          });

          it("should false - wrong value", async function () {
            const name = "PoX太郎";
            const wrongValue = ethers.utils.parseUnits("0.0001", "ether");
            await expect(proofOfDonation.connect(user1).donate(donationIndex, name, user1.address, { value: wrongValue })).to.be.revertedWith(
              "invalid value"
            );
          });

          describe("Withdraw ETH", function () {
            it("should success", async function () {
              expect(await ethers.provider.getBalance(proofOfDonation.address)).to.be.greaterThan(0);

              const txWithdrawETH = await proofOfDonation.withdrawETH(deployer.address);
              const txReceipt = await txWithdrawETH.wait();
              expect(await txReceipt.status).to.equal(1);

              expect(await ethers.provider.getBalance(proofOfDonation.address)).to.equal(0);
            });

            it("should false - not owner", async function () {
              await expect(proofOfDonation.connect(user1).withdrawETH(user1.address)).to.be.revertedWithCustomError(
                proofOfDonation,
                "OwnableUnauthorizedAccount"
              );
            });
          });

          describe("Withdraw ERC20", function () {
            it("should success", async function () {
              const TestERC20 = await ethers.getContractFactory("TestERC20");
              const initialSupply = ethers.utils.parseUnits("100000000", "ether");
              const testERC20 = await TestERC20.deploy(initialSupply);
              expect(await testERC20.balanceOf(deployer.address)).to.equal(initialSupply);
              testERC20.transfer(proofOfDonation.address, initialSupply);

              expect(await testERC20.balanceOf(proofOfDonation.address)).to.equal(initialSupply);

              const txWithdrawERC20 = await proofOfDonation.withdrawERC20(testERC20.address, deployer.address, initialSupply);
              const txReceipt = await txWithdrawERC20.wait();
              expect(await txReceipt.status).to.equal(1);

              expect(await testERC20.balanceOf(proofOfDonation.address)).to.equal(0);
            });

            it("should false - not owner", async function () {
              const tokenAddress = "0x0000000000000000000000000000000000000000";
              const amount = ethers.utils.parseUnits("10", "ether");
              await expect(proofOfDonation.connect(user1).withdrawERC20(tokenAddress, deployer.address, amount)).to.be.revertedWithCustomError(
                proofOfDonation,
                "OwnableUnauthorizedAccount"
              );
            });
          });
        });

        describe("Get token attributes", function () {
          it("should success", async function () {
            const name = "PoX太郎 - Get token attributes";
            const txMint = await proofOfDonation.mintByOwner(donationIndex, name, user1.address);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);

            const totalSupply = (await proofOfDonation.totalSupply()).toNumber();
            let tokenIds = [];
            for (let i = 1; i <= totalSupply; i++) {
              tokenIds.push(i + donationIndex * 1000000);
            }
            const result = await proofOfDonation.getTokenAttributes(tokenIds);
            expect(result.length).to.equal(tokenIds.length);
            expect(result[tokenIds.length - 1].name).to.equal(name);
          });
        });
      });
    });
  });
});
