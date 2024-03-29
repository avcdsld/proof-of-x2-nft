import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deploy", function () {
  it("should success", async function () {
    const [deployer, minter, user1, user2] = await ethers.getSigners();

    const ProofOfVisit = await ethers.getContractFactory("ProofOfVisit");
    const proofOfVisit = await ProofOfVisit.deploy();

    const imageBaseUrl = "https://ara.mypinata.cloud/ipfs/QmdvFCsYyUdf3W8qS9neWKA3Cc8SZoSpdCnB2ErcLvnBDD/#";
    const imageUrlSuffix = "";
    const dataBaseUrl = "https://ara.mypinata.cloud/ipfs/QmeRPLFySAHpP8neTFqNebyP3afhtmEikxkf678CKKTHUa/";
    const Renderer = await ethers.getContractFactory("Renderer");
    const renderer = await Renderer.deploy(imageBaseUrl, imageUrlSuffix, dataBaseUrl);

    const imageBaseUrlDigShibuya = "https://ara.mypinata.cloud/ipfs/QmVwswDC89AKBybNUCo6j2yu7kCT9Qn3TuRX4gCqkTQ4fY/";
    const imageUrlSuffixDigShibuya = ".gif";
    const RendererDigShibuya = await ethers.getContractFactory("RendererDigShibuya");
    const rendererDigShibuya = await RendererDigShibuya.deploy(imageBaseUrlDigShibuya, imageUrlSuffixDigShibuya, proofOfVisit.address);

    const txSetMinter = await proofOfVisit.setMinter(minter.address);
    const txReceipt = await txSetMinter.wait();
    expect(await txReceipt.status).to.equal(1);

    describe("Set exhibition", function () {
      it("should success", async function () {
        const currentTimestampInSeconds = Math.round(Date.now() / 1000);
        const exhibitionIndex = 1;
        const exhibitionName = "Proof of X";
        const startTime = currentTimestampInSeconds;
        const endTime = currentTimestampInSeconds + (60 * 60 * 24 * 7);
        const txSetExhibition = await proofOfVisit.setExhibition(exhibitionIndex, exhibitionName, startTime, endTime, renderer.address);
        const txReceipt = await txSetExhibition.wait();
        expect(await txReceipt.status).to.equal(1);

        describe("Mint by owner", function () {
          it("should success", async function () {
            const name = "\"PoX太郎\"";
            const role = "Artist";
            const mintCode = "abcdef - Mint by owner";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const withPermit = false;
            const txMint = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, user1.address, hash, withPermit);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            const tokenId = txReceipt.events![0].args!.tokenId;
            console.log(await proofOfVisit.tokenURI(tokenId));
          });

          it("should success - with permit", async function () {
            const name = "PoX太郎";
            const role = "";
            const mintCode = "abcdef - Mint by owner - with permit";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const withPermit = true;
            const txMint = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, user1.address, hash, withPermit);
            const txReceipt = await txMint.wait();
            expect(txReceipt.events![1].event).to.equals("Approval");
            expect(txReceipt.events![1].args!.owner).to.equals(user1.address);
            expect(txReceipt.events![1].args!.approved).to.equals(deployer.address);
            const tokenId = txReceipt.events![1].args!.tokenId;

            const txTransfer = await proofOfVisit.transferFrom(user1.address, deployer.address, tokenId);
            const txTransferReceipt = await txTransfer.wait();
            expect(await txTransferReceipt.status).to.equal(1);
          });

          it("should false - wrong owner", async function () {
            const name = "PoX太郎";
            const role = "Artist";
            const mintCode = "abcdef - Mint by owner 2";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const withPermit = false;
            await expect(proofOfVisit.connect(user1).mintByOwner(exhibitionIndex, name, role, user1.address, hash, withPermit)).to.be.revertedWithCustomError(
              proofOfVisit,
              "OwnableUnauthorizedAccount"
            );
          });
        });

        describe("Mint by user", function () {
          it("should success", async function () {
            const name = "PoX太郎";
            const mintCode = "abcdef - Mint by user";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const sig = await minter.signMessage(ethers.utils.arrayify(hash));
            const txMint = await proofOfVisit.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, sig);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);

            await expect(proofOfVisit.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, sig)).to.be.revertedWith(
              "minted hash"
            );
          });

          it("should false - invalid hash/sig", async function () {
            const name = "PoX太郎";
            const mintCode = "abcdef - Mint by user 2";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const invalidHash = ethers.utils.solidityKeccak256(["string"], ["for invalid sig"]);
            const invalidSig = await minter.signMessage(ethers.utils.arrayify(invalidHash));
            const invalidSigSigner = await deployer.signMessage(ethers.utils.arrayify(hash));
            await expect(proofOfVisit.connect(user1).mint(exhibitionIndex, name, mintCodeHash, invalidHash, invalidSig)).to.be.revertedWith(
              "invalid hash"
            );
            await expect(proofOfVisit.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, invalidSig)).to.be.revertedWith(
              "invalid sig"
            );
            await expect(proofOfVisit.connect(user1).mint(exhibitionIndex, name, mintCodeHash, hash, invalidSigSigner)).to.be.revertedWith(
              "invalid sig"
            );
          });
        });

        describe("Buy", function () {
          it("should success", async function () {
            const price = ethers.utils.parseUnits("0.01", "ether");
            const enabled = true;
            const txSetSale = await proofOfVisit.setSale(exhibitionIndex, price, enabled);
            const txSetSaleReceipt = await txSetSale.wait();
            expect(await txSetSaleReceipt.status).to.equal(1);

            const txBuy = await proofOfVisit.connect(user1).buy(user1.address, { value: price });
            const txBuyReceipt = await txBuy.wait();
            expect(await txBuyReceipt.status).to.equal(1);
          });

          it("should false - wrong price", async function () {
            const price = ethers.utils.parseUnits("0.01", "ether");
            const enabled = true;
            const txSetSale = await proofOfVisit.setSale(exhibitionIndex, price, enabled);
            const txSetSaleReceipt = await txSetSale.wait();
            expect(await txSetSaleReceipt.status).to.equal(1);

            const wrongPrice = ethers.utils.parseUnits("0.0001", "ether");
            await expect(proofOfVisit.connect(user1).buy(user1.address, { value: wrongPrice })).to.be.revertedWith(
              "invalid value"
            );
          });

          describe("Withdraw ETH", function () {
            it("should success", async function () {
              expect(await ethers.provider.getBalance(proofOfVisit.address)).to.be.greaterThan(0);

              const txWithdrawETH = await proofOfVisit.withdrawETH(deployer.address);
              const txReceipt = await txWithdrawETH.wait();
              expect(await txReceipt.status).to.equal(1);

              expect(await ethers.provider.getBalance(proofOfVisit.address)).to.equal(0);
            });

            it("should false - not owner", async function () {
              await expect(proofOfVisit.connect(user1).withdrawETH(user1.address)).to.be.revertedWithCustomError(
                proofOfVisit,
                "OwnableUnauthorizedAccount"
              );
            });
          });
        });

        describe("Get token attributes", function () {
          it("should success", async function () {
            const name = "PoX太郎 - Get token attributes";
            const role = "";
            const mintCode = "abcdef - Get token attributes";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const withPermit = false;
            const txMint = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, user2.address, hash, withPermit);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);

            const totalSupply = (await proofOfVisit.totalSupply()).toNumber();
            let tokenIds = [];
            for (let i = 1; i <= totalSupply; i++) {
              tokenIds.push(i + exhibitionIndex * 1000000);
            }
            const result = await proofOfVisit.getTokenAttributes(tokenIds);
            expect(result.length).to.equal(tokenIds.length);
            expect(result[tokenIds.length - 1].name).to.equal(name);
          });
        });
      });
    });

    describe("DIG SHIBUYA - Set exhibition", function () {
      it("should success", async function () {
        const currentTimestampInSeconds = Math.round(Date.now() / 1000);
        const exhibitionIndex = 2;
        const exhibitionName = "Proof of X in DIG SHIBUYA";
        const startTime = currentTimestampInSeconds;
        const endTime = currentTimestampInSeconds + (60 * 60 * 24 * 7);
        const txSetExhibition = await proofOfVisit.setExhibition(exhibitionIndex, exhibitionName, startTime, endTime, rendererDigShibuya.address);
        const txReceipt = await txSetExhibition.wait();
        expect(await txReceipt.status).to.equal(1);

        describe("DIG SHIBUYA - Mint by owner", function () {
          it("should success", async function () {
            const name = "\"PoX太郎\"";
            const role = "Artist";
            const mintCode = "abcdef - Mint by owner - DIG SHIBUYA";
            const mintCodeHash = ethers.utils.solidityKeccak256(["string"], [mintCode]);
            const hash = ethers.utils.solidityKeccak256(["address", "bytes32"], [user1.address, mintCodeHash]);
            const withPermit = false;
            const txMint = await proofOfVisit.mintByOwner(exhibitionIndex, name, role, user1.address, hash, withPermit);
            const txReceipt = await txMint.wait();
            expect(await txReceipt.status).to.equal(1);
            const tokenId = txReceipt.events![0].args!.tokenId;
            console.log(await proofOfVisit.tokenURI(tokenId));
          });
        });
      });
    });
  });
});
