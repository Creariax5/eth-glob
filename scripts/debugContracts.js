// Save as scripts/debugContracts.js
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log('🔍 Debugging contract deployments and function calls...');
  
  const network = hre.network.name;
  console.log(`📡 Current network: ${network}`);
  
  // Load deployment info
  const deploymentFile = `./deployments/${network}.json`;
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ No deployment file found: ${deploymentFile}`);
    return;
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log('📋 Deployed contracts:', deployment.contracts);
  
  const [signer] = await hre.ethers.getSigners();
  console.log(`🔑 Using signer: ${signer.address}`);
  
  // Check each contract
  const contracts = deployment.contracts;
  
  for (const [name, address] of Object.entries(contracts)) {
    console.log(`\n🔍 Checking ${name} at ${address}:`);
    
    try {
      // Check if contract exists
      const code = await hre.ethers.provider.getCode(address);
      if (code === '0x') {
        console.log(`❌ No contract code found at ${address}`);
        continue;
      }
      console.log(`✅ Contract code found: ${code.length} bytes`);
      
      // Try to connect to contract
      let contract;
      switch (name) {
        case 'priceMonitor':
          contract = await hre.ethers.getContractAt("SimplePriceMonitor", address);
          break;
        case 'usdcManager':
          contract = await hre.ethers.getContractAt("USDCManager", address);
          break;
        case 'crossChainInsurance':
          contract = await hre.ethers.getContractAt("SimpleCrossChainInsurance", address);
          break;
        default:
          console.log(`⚠️ Unknown contract type: ${name}`);
          continue;
      }
      
      console.log(`✅ Contract connected successfully`);
      
      // Test specific functions
      if (name === 'usdcManager') {
        console.log('🧪 Testing USDCManager functions:');
        
        try {
          // Test getPoolStats
          const poolStats = await contract.getPoolStats();
          console.log(`✅ getPoolStats(): ${poolStats.toString()}`);
        } catch (error) {
          console.log(`❌ getPoolStats() failed: ${error.message}`);
          
          // Check if the function exists in the ABI
          const functionExists = contract.interface.fragments.find(f => f.name === 'getPoolStats');
          if (functionExists) {
            console.log(`✅ Function exists in ABI: ${functionExists.format()}`);
          } else {
            console.log(`❌ Function 'getPoolStats' not found in ABI`);
          }
        }
        
        try {
          // Test userDeposits
          const userDeposits = await contract.userDeposits(signer.address);
          console.log(`✅ userDeposits(${signer.address}): ${userDeposits.toString()}`);
        } catch (error) {
          console.log(`❌ userDeposits() failed: ${error.message}`);
        }
        
        try {
          // Test usdcToken address
          const usdcToken = await contract.usdcToken();
          console.log(`✅ usdcToken(): ${usdcToken}`);
        } catch (error) {
          console.log(`❌ usdcToken() failed: ${error.message}`);
        }
      }
      
      if (name === 'crossChainInsurance') {
        console.log('🧪 Testing SimpleCrossChainInsurance functions:');
        
        try {
          const userCoverage = await contract.getUserCoverage(signer.address);
          console.log(`✅ getUserCoverage(${signer.address}): ${userCoverage.toString()}`);
        } catch (error) {
          console.log(`❌ getUserCoverage() failed: ${error.message}`);
        }
        
        try {
          const priceMonitorAddr = await contract.priceMonitor();
          console.log(`✅ priceMonitor(): ${priceMonitorAddr}`);
        } catch (error) {
          console.log(`❌ priceMonitor() failed: ${error.message}`);
        }
      }
      
      if (name === 'priceMonitor') {
        console.log('🧪 Testing SimplePriceMonitor functions:');
        
        try {
          const protocolCount = await contract.getProtocolCount();
          console.log(`✅ getProtocolCount(): ${protocolCount.toString()}`);
        } catch (error) {
          console.log(`❌ getProtocolCount() failed: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${name}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Debug complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });