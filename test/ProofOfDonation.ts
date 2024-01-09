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
        const name = "NAMAZU-E by EXCALIBUR";
        const description = `Proof of Donation #1 by Proof of X project, a tangible expression of support for the victims of the January 2024 Noto Peninsula Earthquake in Japan. This proof of donation serves as a memento, attesting that you've contributed to the cause. Every donation will be dedicated to aiding those affected.\\n\\nDelving into Japanese folklore, and you'll encounter Namazu, a mythical catfish believed to trigger earthquakes through its tumultuous movements in underground rivers. This age-old tale weaves a narrative that connects natural phenomena with mythical beings, offering an explanation for seismic activities.\\n\\nIn one captivating story, the god Kashima takes center stage, using a colossal stone to subdue Namazu and prevent earthquakes. However, when Kashima lowers his guard, Namazu slips away, setting off tremors. This narrative captures the delicate equilibrium thought to exist between gods and mythical creatures, controlling the forces of nature. \\n\\nThrough the process of minting this NAMAZU-E, which is a NAMAZU art,  on-chain, our project unfolds with the purpose of channeling our thoughts and emotions towards the reconstruction efforts. Additionally, transparent records of donors will be maintained, ensuring a clear and accountable journey towards supporting those in need. The donation will be delivered to Sekijuji.`;
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
            const name = "Ara";
            const country = "Japan";
            const message = "I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string", "string", "string"], [name, country, message]);
            const remembranceFromContract = await proofOfDonation.remembrance(name, country, message);
            expect(remembranceFromContract).to.equal(remembrance);

            const txDonate = await proofOfDonation.connect(user1).donate(tokenId, quantity, remembrance, { value });
            const txReceipt = await txDonate.wait();
            expect(await txReceipt.status).to.equal(1);
            console.log(await proofOfDonation.uri(tokenId));
          });

          it("should success 2", async function () {
            const quantity = 100;
            const value = price.mul(quantity);
            const name = "Ara";
            const country = "Japan";
            const message = "I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string", "string", "string"], [name, country, message]);
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
            const name = "Ara";
            const country = "Japan";
            const message = "I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string", "string", "string"], [name, country, message]);
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
            const name = "Ara";
            const country = "Japan";
            const message = "I hope this will help the victims.";
            const remembrance = ethers.utils.solidityKeccak256(["string", "string", "string"], [name, country, message]);
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
