// Complete deployment script for all 3 chains
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting complete 3-chain deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  // LayerZero Endpoint addresses (V2)
  const endpoints = {
    ethereumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    arbitrumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f", 
    baseSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f"
  };
  
  // Get current network
  const network = await hre.network;
  const chainName = network.name;
  
  console.log(`📡 Deploying to: ${chainName}`);
  
  // 1. Deploy your existing contracts first
  console.log("\n1️⃣ Deploying PriceMonitor...");
  const PriceMonitor = await ethers.getContractFactory("SimplePriceMonitor");
  const priceMonitor = await PriceMonitor.deploy();
  await priceMonitor.waitForDeployment();
  console.log("✅ PriceMonitor deployed to:", await priceMonitor.getAddress());
  
  console.log("\n2️⃣ Deploying USDCManager...");
  const USDCManager = await ethers.getContractFactory("USDCManager");
  
  // USDC and Circle contract addresses per chain
  const circleContracts = {
    ethereumSepolia: {
      usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      tokenMessenger: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
      messageTransmitter: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD"
    },
    arbitrumSepolia: {
      usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      tokenMessenger: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
      messageTransmitter: "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872"
    },
    baseSepolia: {
      usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      tokenMessenger: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5", 
      messageTransmitter: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD"
    }
  };
  
  const chainContracts = circleContracts[chainName];
  if (!chainContracts) {
    throw new Error(`Chain ${chainName} not supported`);
  }
  
  const usdcManager = await USDCManager.deploy(
    chainContracts.usdc,
    chainContracts.tokenMessenger,
    chainContracts.messageTransmitter
  );
  await usdcManager.waitForDeployment();
  console.log("✅ USDCManager deployed to:", await usdcManager.getAddress());
  
  // 3. Deploy LayerZero contract
  console.log("\n3️⃣ Deploying SimpleCrossChainInsurance...");
  const endpoint = endpoints[chainName];
  if (!endpoint) {
    throw new Error(`LayerZero endpoint not found for ${chainName}`);
  }
  
  const CrossChainInsurance = await ethers.getContractFactory("SimpleCrossChainInsurance");
  const crossChainInsurance = await CrossChainInsurance.deploy(
    endpoint,
    deployer.address,
    await priceMonitor.getAddress(),
    await usdcManager.getAddress()
  );
  await crossChainInsurance.waitForDeployment();
  console.log("✅ SimpleCrossChainInsurance deployed to:", await crossChainInsurance.getAddress());
  
  // 4. Configure contracts
  console.log("\n4️⃣ Configuring contract connections...");
  
  // Add some test protocols to PriceMonitor
  const testProtocols = [
    { id: ethers.keccak256(ethers.toUtf8Bytes("AAVE")), name: "AAVE" },
    { id: ethers.keccak256(ethers.toUtf8Bytes("COMPOUND")), name: "Compound" },
    { id: ethers.keccak256(ethers.toUtf8Bytes("UNISWAP")), name: "Uniswap" }
  ];
  
  for (const protocol of testProtocols) {
    try {
      await priceMonitor.addProtocol(
        protocol.id,
        "0x694AA1769357215DE4FAC081bf1f309aDC325306" // ETH/USD feed as placeholder
      );
      console.log(`✅ Added protocol: ${protocol.name}`);
    } catch (error) {
      console.log(`⚠️  Protocol ${protocol.name} might already exist`);
    }
  }
  
  // Add LayerZero chain IDs for cross-chain support
  const chainIds = {
    ethereumSepolia: 40161, // LayerZero testnet chain ID
    arbitrumSepolia: 40231,
    baseSepolia: 40245
  };
  
  // Add all other chains as supported destinations
  for (const [chain, chainId] of Object.entries(chainIds)) {
    if (chain !== chainName) {
      try {
        await crossChainInsurance.addSupportedChain(chainId);
        console.log(`✅ Added supported chain: ${chain} (${chainId})`);
      } catch (error) {
        console.log(`⚠️  Chain ${chain} might already be supported`);
      }
    }
  }
  
  // 5. Test basic functionality
  console.log("\n5️⃣ Testing basic contract functionality...");
  
  try {
    // Test protocol health check
    const aaveId = ethers.keccak256(ethers.toUtf8Bytes("AAVE"));
    const isHealthy = await crossChainInsurance.checkProtocolHealthCrossChain(aaveId);
    console.log(`✅ Protocol health check working: AAVE is ${isHealthy ? 'healthy' : 'at risk'}`);
  } catch (error) {
    console.log(`⚠️  Protocol health check: ${error.message}`);
  }
  
  // 6. Output deployment summary
  console.log("\n🎯 DEPLOYMENT COMPLETE!");
  console.log("📋 Contract Addresses:");
  console.log(`  PriceMonitor: ${await priceMonitor.getAddress()}`);
  console.log(`  USDCManager: ${await usdcManager.getAddress()}`);
  console.log(`  SimpleCrossChainInsurance: ${await crossChainInsurance.getAddress()}`);
  console.log(`\n🔗 Network: ${chainName}`);
  console.log(`🌐 LayerZero Endpoint: ${endpoint}`);
  
  // Save addresses for frontend
  const deploymentInfo = {
    chainName,
    network: chainName,
    contracts: {
      priceMonitor: await priceMonitor.getAddress(),
      usdcManager: await usdcManager.getAddress(),
      crossChainInsurance: await crossChainInsurance.getAddress()
    },
    layerZero: {
      endpoint,
      chainId: chainIds[chainName]
    },
    circle: chainContracts
  };
  
  console.log("\n📁 Frontend Integration Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Write to file for frontend
  const fs = require('fs');
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    `${deploymentsDir}/${chainName}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`💾 Deployment info saved to deployments/${chainName}.json`);
  
  console.log("\n🚀 Ready for frontend integration!");
  console.log("✅ All 3 bounty requirements are now deployable!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });