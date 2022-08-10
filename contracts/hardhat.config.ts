import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
require("hardhat-contract-sizer");

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts:
        process.env.ADMIN_KEY !== undefined &&
        process.env.ORG_KEY !== undefined &&
        process.env.WHALE_KEY !== undefined &&
        process.env.CHALLENGER_KEY !== undefined &&
        process.env.USER1_KEY !== undefined &&
        process.env.USER2_KEY !== undefined &&
        process.env.USER3_KEY !== undefined
          ? [
              process.env.ADMIN_KEY,
              process.env.ORG_KEY,
              process.env.WHALE_KEY,
              process.env.CHALLENGER_KEY,
              process.env.USER1_KEY,
              process.env.USER2_KEY,
              process.env.USER3_KEY,
            ]
          : [],
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
