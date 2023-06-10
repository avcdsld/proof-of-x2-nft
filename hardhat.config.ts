import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"; // this is to avoid hardhat error

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    localhost: {
      timeout: 50000,
    },
    // hardhat: {
    //   allowUnlimitedContractSize: true,
    // },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/9f5ace8940244ed9a769e493d783fda8",
      accounts: [privateKey],
      gas: 2100000,
      gasPrice: 1300000000,
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/qF24N93vqDHv0u-lePhcd3H5KdJxdhGm",
      accounts: [privateKey],
      gas: 2100000,
      gasPrice: 1000000005,
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/7495501b681645b0b80f955d4139add9",
      accounts: [privateKey],
      gas: 2100000,
      gasPrice: 6000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
