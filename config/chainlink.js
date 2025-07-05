// Chainlink Price Feed Configuration for DeFi Insurance
const chainlinkConfig = {
  testnet: {
    // Ethereum Sepolia Price Feeds
    ethereumSepolia: {
      chainId: 11155111,
      rpcUrl: "https://1rpc.io/sepolia",
      linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      ccipRouter: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
      chainSelector: "16015286601757825753",
      
      // Major crypto price feeds
      priceFeeds: {
        // ETH/USD - Most important for DeFi protocols
        "ETH/USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        // BTC/USD - Major collateral asset
        "BTC/USD": "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
        // USDC/USD - Stablecoin reference
        "USDC/USD": "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
        // LINK/USD - For oracle operations
        "LINK/USD": "0xc59E3633BAAC79493d908e63626716e204A45EdF",
        
        // DeFi Protocol Tokens
        "AAVE/USD": "0x3F3A5e8Bc7F66DA23b0e2A8C6E9F0D29d3F9D84f", // May not exist on testnet
        "COMP/USD": "0x9F68B8e1A0e69b7E6bC8A7b9C2B89D1C56B3D8F4", // May not exist on testnet
        "UNI/USD": "0xDAaC5e8CE1C0ffFe54b1cCe9DE6dB2e03b1E8E8A",  // May not exist on testnet
      }
    },
    
    // Arbitrum Sepolia Price Feeds
    arbitrumSepolia: {
      chainId: 421614,
      rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
      linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
      ccipRouter: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
      chainSelector: "3478487238524512106",
      
      priceFeeds: {
        "ETH/USD": "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
        "BTC/USD": "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69",
        "USDC/USD": "0x0153002d20B96532C639313c2d54c3dA09109309",
        "LINK/USD": "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298",
      }
    },
    
    // Base Sepolia Price Feeds
    baseSepolia: {
      chainId: 84532,
      rpcUrl: "https://sepolia.base.org",
      linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
      ccipRouter: "0xD3b06cEbF099CE7DA4AcCf578aaeFe5238Cd4CC8",
      chainSelector: "10344971235874465080",
      
      priceFeeds: {
        "ETH/USD": "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
        "BTC/USD": "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1", // May be same as ETH on testnet
        "USDC/USD": "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
        "LINK/USD": "0xb113F5A928BCfF189C998ab20d753a47F9dE5A61",
      }
    }
  },
  
  // DeFi Protocol Risk Thresholds for Insurance
  riskThresholds: {
    // Price deviation triggers (percentage)
    priceDeviationTrigger: 10, // 10% deviation triggers insurance check
    
    // Protocol-specific thresholds
    protocols: {
      aave: {
        maxLtvTrigger: 0.8,      // 80% LTV ratio trigger
        liquidationThreshold: 0.85, // 85% liquidation threshold
        minimumHealthFactor: 1.1,   // Below 1.1 health factor
      },
      compound: {
        maxLtvTrigger: 0.75,      // 75% LTV ratio trigger
        liquidationThreshold: 0.8, // 80% liquidation threshold
        minimumCollateralFactor: 0.7, // 70% collateral factor
      },
      uniswap: {
        maxSlippage: 0.05,        // 5% max slippage
        minLiquidity: 10000,      // $10k minimum liquidity
        impermanentLossThreshold: 0.1, // 10% IL threshold
      }
    }
  }
};

module.exports = chainlinkConfig;