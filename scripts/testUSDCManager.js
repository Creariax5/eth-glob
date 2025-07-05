const hre = require("hardhat");

async function main() {
  console.log("🔗 Testing USDCManager contract...");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  // Mock addresses for testing (real addresses would be used on testnet)
  const mockUSDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC
  const mockTokenMessenger = "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5"; // Sepolia Token Messenger
  const mockMessageTransmitter = "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD"; // Sepolia Message Transmitter
  
  // Deploy SimplePriceMonitor first (as dependency)
  console.log("\n📊 Deploying SimplePriceMonitor...");
  const SimplePriceMonitor = await hre.ethers.getContractFactory("SimplePriceMonitor");
  const priceMonitor = await SimplePriceMonitor.deploy();
  await priceMonitor.waitForDeployment();
  const priceMonitorAddress = await priceMonitor.getAddress();
  console.log("✅ SimplePriceMonitor deployed to:", priceMonitorAddress);
  
  // Deploy USDCManager
  console.log("\n💰 Deploying USDCManager...");
  const USDCManager = await hre.ethers.getContractFactory("USDCManager");
  const usdcManager = await USDCManager.deploy(
    mockUSDC,
    mockTokenMessenger,
    mockMessageTransmitter,
    priceMonitorAddress
  );
  await usdcManager.waitForDeployment();
  
  const usdcManagerAddress = await usdcManager.getAddress();
  console.log("✅ USDCManager deployed to:", usdcManagerAddress);
  
  // Test basic functionality
  console.log("\n🧪 Testing contract functions:");
  
  try {
    // Test pool stats
    const [totalBalance, totalClaims, totalPremiums] = await usdcManager.getPoolStats();
    console.log("✅ Pool Stats Retrieved:");
    console.log(`  Total Balance: ${totalBalance}`);
    console.log(`  Total Claims: ${totalClaims}`);
    console.log(`  Total Premiums: ${totalPremiums}`);
    
    // Test coverage retrieval (should return empty coverage)
    const ethProtocolId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ETH"));
    const coverage = await usdcManager.getUserCoverage(deployer.address, ethProtocolId);
    console.log("✅ User Coverage Retrieved:");
    console.log(`  Coverage Amount: ${coverage.coverageAmount}`);
    console.log(`  Premium Paid: ${coverage.premiumPaid}`);
    console.log(`  Is Active: ${coverage.isActive}`);
    
    // Test domain constants
    const ethDomain = await usdcManager.ETHEREUM_DOMAIN();
    const arbDomain = await usdcManager.ARBITRUM_DOMAIN();
    const baseDomain = await usdcManager.BASE_DOMAIN();
    console.log("✅ Domain Constants:");
    console.log(`  Ethereum Domain: ${ethDomain}`);
    console.log(`  Arbitrum Domain: ${arbDomain}`);
    console.log(`  Base Domain: ${baseDomain}`);
    
    console.log("\n📝 Note: USDC operations require actual USDC tokens and testnet deployment");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
  
  console.log("\n🎯 USDCManager test complete!");
  console.log("✅ Ready for integration testing...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });