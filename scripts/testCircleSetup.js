const hre = require("hardhat");
const CCTPHelper = require("../utils/cctpHelper");

async function main() {
  console.log("🔗 Testing Circle CCTP setup...");
  
  const cctp = new CCTPHelper();
  
  // Test address (Hardhat default account)
  const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  // Test configuration
  console.log("📋 CCTP Configuration:");
  const supportedChains = cctp.getSupportedChains();
  
  for (const chain of supportedChains) {
    console.log(`  ${chain}:`);
    console.log(`    Domain ID: ${cctp.getDomainId(chain)}`);
    console.log(`    USDC: ${cctp.getUSDCContract(chain)}`);
    console.log(`    Token Messenger: ${cctp.getTokenMessenger(chain)}`);
  }
  
  // Test network connections
  console.log("\n🌐 Testing Network Connections:");
  for (const chain of supportedChains) {
    const connection = await cctp.testConnection(chain);
    if (connection.success) {
      console.log(`  ✅ ${chain}: Block ${connection.blockNumber} (Chain ID: ${connection.chainId})`);
    } else {
      console.log(`  ❌ ${chain}: ${connection.error}`);
    }
  }
  
  // Test USDC balance reading
  console.log("\n💰 Testing USDC Balance Reading:");
  for (const chain of supportedChains) {
    try {
      const balance = await cctp.getUSDCBalance(chain, testAddress);
      if (balance) {
        console.log(`  ✅ ${chain}: ${balance.balance} ${balance.symbol}`);
      } else {
        console.log(`  ❌ ${chain}: Failed to get balance`);
      }
    } catch (error) {
      console.log(`  ❌ ${chain}: ${error.message}`);
    }
  }
  
  console.log("\n🎯 Circle CCTP setup verification complete!");
  console.log("✅ Ready for Chainlink price feed setup...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
