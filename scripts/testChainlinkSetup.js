const hre = require("hardhat");
const ChainlinkHelper = require("../utils/chainlinkHelper");

async function main() {
  console.log("🔗 Testing Chainlink Price Feed setup...");
  
  const chainlink = new ChainlinkHelper();
  
  // Test address (Hardhat default account)
  const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
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
  
  // Test price feed data retrieval
  console.log("\n💰 Testing Price Feed Data:");
  for (const chain of supportedChains) {
    console.log(`\n  📊 ${chain.toUpperCase()} Price Feeds:`);
    
    const priceFeeds = chainlink.getSupportedPriceFeeds(chain);
    for (const priceFeed of priceFeeds) {
      try {
        const priceData = await chainlink.getLatestPrice(chain, priceFeed);
        if (priceData) {
          const timeSinceUpdate = Math.floor(priceData.timeSinceUpdate / 60000); // minutes
          console.log(`    ✅ ${priceFeed}: $${parseFloat(priceData.price).toFixed(2)} (${timeSinceUpdate}m ago)`);
        } else {
          console.log(`    ❌ ${priceFeed}: Failed to get price`);
        }
      } catch (error) {
        console.log(`    ❌ ${priceFeed}: ${error.message}`);
      }
    }
  }
  
  // Test protocol health checks
  console.log("\n🏥 Testing Protocol Health Checks:");
  const protocols = ['aave', 'compound', 'uniswap'];
  
  for (const protocol of protocols) {
    try {
      const health = await chainlink.checkProtocolHealth(protocol);
      const statusEmoji = health.status === 'HEALTHY' ? '✅' : health.status === 'AT_RISK' ? '⚠️' : '❌';
      console.log(`  ${statusEmoji} ${protocol.toUpperCase()}: ${health.status} (Risk: ${health.riskLevel})`);
      console.log(`    ETH Price: $${parseFloat(health.checks.ethPrice).toFixed(2)}`);
      console.log(`    BTC Price: $${parseFloat(health.checks.btcPrice).toFixed(2)}`);
      console.log(`    Data Freshness: ${health.checks.priceDataFresh ? 'Fresh' : 'Stale'}`);
    } catch (error) {
      console.log(`  ❌ ${protocol.toUpperCase()}: ${error.message}`);
    }
  }
  
  // Test price deviation monitoring
  console.log("\n📈 Testing Price Deviation Monitoring:");
  try {
    // Test ETH price deviation with mock reference price
    const ethDeviation = await chainlink.checkPriceDeviation('ethereumSepolia', 'ETH/USD', 3000, 5);
    if (ethDeviation) {
      const deviationEmoji = ethDeviation.isTriggered ? '🚨' : '✅';
      console.log(`  ${deviationEmoji} ETH/USD Deviation: ${ethDeviation.deviation.toFixed(2)}% (Threshold: ${ethDeviation.threshold}%)`);
      console.log(`    Current: $${ethDeviation.currentPrice.toFixed(2)} vs Reference: $${ethDeviation.referencePrice}`);
    }
  } catch (error) {
    console.log(`  ❌ Price Deviation Test: ${error.message}`);
  }
  
  // Display risk thresholds
  console.log("\n⚙️ Risk Threshold Configuration:");
  const riskThresholds = chainlink.getRiskThresholds();
  console.log(`  General Price Deviation Trigger: ${riskThresholds.priceDeviationTrigger}%`);
  
  Object.entries(riskThresholds.protocols).forEach(([protocol, thresholds]) => {
    console.log(`  ${protocol.toUpperCase()} Thresholds:`);
    Object.entries(thresholds).forEach(([key, value]) => {
      console.log(`    ${key}: ${value}`);
    });
  });
  
  console.log("\n🎯 Chainlink setup verification complete!");
  console.log("✅ Ready for contract development phase...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });