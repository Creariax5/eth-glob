require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "paris"
        },
      },
      {
        version: "0.8.19", // For LayerZero contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // Ethereum Sepolia Testnet - EMERGENCY BACKUP RPCs
    ethereumSepolia: {
      // TRY THESE IN ORDER (uncomment one at a time)
      url: process.env.ETHEREUM_SEPOLIA_RPC || "https://sepolia.drpc.org",           // BACKUP 1
      // url: process.env.ETHEREUM_SEPOLIA_RPC || "https://rpc.sepolia.org",           // BACKUP 2  
      // url: process.env.ETHEREUM_SEPOLIA_RPC || "https://ethereum-sepolia.blockpi.network/v1/rpc/public", // BACKUP 3
      // url: process.env.ETHEREUM_SEPOLIA_RPC || "https://rpc2.sepolia.org",          // BACKUP 4
      // url: process.env.ETHEREUM_SEPOLIA_RPC || "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // BACKUP 5
      
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 3000000,
      gasPrice: 20000000000, // 20 gwei
      timeout: 60000, // 60 seconds timeout
    },
    // Arbitrum Sepolia Testnet  
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
      gas: 5000000,
      gasPrice: 100000000, // 0.1 gwei (cheaper on L2)
    },
    // Base Sepolia Testnet
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org", 
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      gas: 3000000,
      gasPrice: 1000000000, // 1 gwei
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      },
      {
        network: "baseSepolia", 
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};