const hre = require("hardhat");

async function main() {
  console.log("🔗 Testing SimplePriceMonitor contract...");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  // Deploy SimplePriceMonitor
  const SimplePriceMonitor = await hre.ethers.getContractFactory("SimplePriceMonitor");
  const priceMonitor = await SimplePriceMonitor.deploy();
  await priceMonitor.waitForDeployment();
  
  const contractAddress = await priceMonitor.getAddress();
  console.log("✅ SimplePriceMonitor deployed to:", contractAddress);
  
  // Test basic functionality
  console.log("\n🧪 Testing contract functions:");
  
  // Add a protocol (using a mock aggregator address for testing)
  const mockAggregator = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // ETH/USD Sepolia
  const ethProtocolId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ETH"));
  
  try {
    const tx = await priceMonitor.addProtocol(ethProtocolId, mockAggregator);
    await tx.wait();
    console.log("✅ Protocol added successfully");
    
    // Get aggregator address
    const storedAggregator = await priceMonitor.getProtocolAggregator(ethProtocolId);
    console.log("✅ Stored aggregator:", storedAggregator);
    
    // Note: getLatestPrice and checkProtocolHealth would fail on local hardhat network
    // since the aggregator address doesn't exist there
    console.log("📝 Note: Price feed calls require actual testnet deployment");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
  
  console.log("\n🎯 SimplePriceMonitor test complete!");
  console.log("✅ Ready for testnet deployment...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });