const hre = require("hardhat");
const ChainlinkHelper = require("../utils/chainlinkHelper");

async function main() {
  console.log("🔗 Testing Chainlink Price Feed helpers (no contracts)...");
  
  const chainlink = new ChainlinkHelper();
  
  // Test configuration overview
  console.log("📋 Chainlink Configuration:");
  const supportedChains = chainlink.getSupportedChains();
  
  for (const chain of supportedChains) {
    const config = chainlink.getChainConfig(chain);
    console.log(`  ${chain}:`);
    console.log(`    Chain ID: ${config.chainId}`);
    console.log(`    LINK Token: ${config.linkToken}`);
    console.log(`    CCIP Router: ${config.ccipRouter}`);
    console.log(`    Available Price Feeds: ${Object.keys(config.priceFeeds).length}`);
    console.log(`    Price Feeds: ${Object.keys(config.priceFeeds).join(', ')}`);
  }
  
  // Test network connections
  console.log("\n🌐 Testing Network Connections:");
  for (const chain of supportedChains) {
    const connection = await chainlink.testConnection(chain);
    if (connection.success) {
      console.log(`  ✅ ${chain}: Block ${connection.blockNumber} (Chain ID: ${connection.chainId})`);
      console.log(`    LINK Balance: ${connection.linkBalance || 'N/A'} LINK`);
      console.log(`    Price Feeds Available: ${connection.availablePriceFeeds}`);
    } else {
      console.log(`  ❌ ${chain}: ${connection.error}`);
    }
  }
  
  // Test a single price feed to verify connectivity
  console.log("\n💰 Testing Single Price Feed (ETH/USD on Ethereum Sepolia):");
  try {
    const ethPrice = await chainlink.getLatestPrice('ethereumSepolia', 'ETH/USD');
    if (ethPrice) {
      const timeSinceUpdate = Math.floor(ethPrice.timeSinceUpdate / 60000); // minutes
      console.log(`  ✅ ETH/USD: $${parseFloat(ethPrice.price).toFixed(2)}`);
      console.log(`    Last Updated: ${timeSinceUpdate} minutes ago`);
      console.log(`    Description: ${ethPrice.description}`);
      console.log(`    Round ID: ${ethPrice.roundId}`);
    } else {
      console.log(`  ❌ Failed to get ETH/USD price`);
    }
  } catch (error) {
    console.log(`  ❌ Error testing ETH/USD: ${error.message}`);
  }
  
  // Test risk thresholds
  console.log("\n⚙️ Risk Threshold Configuration:");
  const riskThresholds = chainlink.getRiskThresholds();
  console.log(`  General Price Deviation Trigger: ${riskThresholds.priceDeviationTrigger}%`);
  
  Object.entries(riskThresholds.protocols).forEach(([protocol, thresholds]) => {
    console.log(`  ${protocol.toUpperCase()} Thresholds:`);
    Object.entries(thresholds).forEach(([key, value]) => {
      console.log(`    ${key}: ${value}`);
    });
  });
  
  console.log("\n🎯 Chainlink helpers test complete!");
  console.log("✅ Ready to fix contract compilation...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });