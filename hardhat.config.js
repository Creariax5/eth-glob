require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Default test private key (Hardhat account #0)
const defaultPrivateKey = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {},
    ethereumSepolia: {
      url: process.env.INFURA_KEY ? `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}` : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [defaultPrivateKey],
      chainId: 11155111,
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [defaultPrivateKey],
      chainId: 421614,
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [defaultPrivateKey],
      chainId: 84532,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    }
  }
};