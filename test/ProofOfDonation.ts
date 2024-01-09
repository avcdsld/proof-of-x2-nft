import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deploy - Proof of Donation", function () {
  it("should success", async function () {
    const [deployer, user1, user2] = await ethers.getSigners();

    const ProofOfDonation = await ethers.getContractFactory("ProofOfDonation");
    const proofOfDonation = await ProofOfDonation.deploy();

    const ProofOfDonationRenderer = await ethers.getContractFactory("ProofOfDonationRenderer");
    const renderer = await ProofOfDonationRenderer.deploy();

    describe("Activate token", function () {
      it("should success", async function () {
        const tokenId = 1;
        const name = "Noto Earthquake 2024";
        const description = "Proof of Donation #1 by Proof of X project is in support of the January 2024 Noto Peninsula Earthquake in Japan. This is a memento to prove you have made a donation. All donations will be used to support the victims.";
        const image = "https://ara.mypinata.cloud/ipfs/QmNayMJmPnWpb4VeZ6nLT4hh5rMJUAkwboVGCiLVKq3Xkk";
        const artworkCreator = "EXCALIBUR";
        const price = ethers.utils.parseUnits("0.001", "ether");

        await renderer.setMetadata(tokenId, name, description, image, artworkCreator);
        const txSetRenderer = await proofOfDonation.setRenderer(renderer.address);
        const txSetRendererReceipt = await txSetRenderer.wait();
        expect(await txSetRendererReceipt.status).to.equal(1);

        const txActivate = await proofOfDonation.activateToken(tokenId, price);
        const txActivateReceipt = await txActivate.wait();
        expect(await txActivateReceipt.status).to.equal(1);

        describe("Donate", function () {
          it("should success", async function () {
            const quantity = 1;
            const value = price.mul(quantity);
            const message = "Japan - I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string"], [message]);
            const remembranceFromContract = await proofOfDonation.remembrance(message);
            expect(remembranceFromContract).to.equal(remembrance);

            const txDonate = await proofOfDonation.connect(user1).donate(tokenId, quantity, remembrance, { value });
            const txReceipt = await txDonate.wait();
            expect(await txReceipt.status).to.equal(1);
            console.log(await proofOfDonation.uri(tokenId));
          });

          it("should success 2", async function () {
            const quantity = 100;
            const value = price.mul(quantity);
            const message = "Japan - I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string"], [message]);
            const txDonate = await proofOfDonation.connect(user2).donate(tokenId, quantity, remembrance, { value });
            const txDonateReceipt = await txDonate.wait();
            expect(await txDonateReceipt.status).to.equal(1);
          });

          it("should false - not active", async function () {
            const txDeactivate = await proofOfDonation.deactivateToken(tokenId);
            const txDeactivateReceipt = await txDeactivate.wait();
            expect(await txDeactivateReceipt.status).to.equal(1);

            const quantity = 100;
            const value = price.mul(quantity);
            const message = "Japan - I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string"], [message]);            
            await expect(proofOfDonation.connect(user1).donate(tokenId, quantity, remembrance, { value })).to.be.revertedWith(
              "not active"
            );

            const txActivate = await proofOfDonation.activateToken(tokenId, price);
            const txActivateReceipt = await txActivate.wait();
            expect(await txActivateReceipt.status).to.equal(1);
          });

          it("should false - wrong value", async function () {
            const quantity = 1;
            const wrongValue = ethers.utils.parseUnits("0.0002", "ether");
            const message = "Japan - I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string"], [message]);            
            await expect(proofOfDonation.connect(user1).donate(tokenId, quantity, remembrance, { value: wrongValue })).to.be.revertedWith(
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
      });
    });
  });
});
