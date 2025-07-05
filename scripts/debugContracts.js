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
      
      // Test ACTUAL functions that exist in contracts
      if (name === 'usdcManager') {
        console.log('🧪 Testing USDCManager functions:');
        
        try {
          // Test getPoolStats (if it fails, the contract state might not be initialized)
          const poolStats = await contract.getPoolStats();
          console.log(`✅ getPoolStats(): ${poolStats.toString()}`);
        } catch (error) {
          console.log(`❌ getPoolStats() failed: ${error.message}`);
          console.log(`   This might indicate uninitialized contract state`);
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

        try {
          // Test domain constants
          const ethDomain = await contract.ETHEREUM_DOMAIN();
          const arbDomain = await contract.ARBITRUM_DOMAIN();
          const baseDomain = await contract.BASE_DOMAIN();
          console.log(`✅ Domain constants - ETH: ${ethDomain}, ARB: ${arbDomain}, BASE: ${baseDomain}`);
        } catch (error) {
          console.log(`❌ Domain constants failed: ${error.message}`);
        }
      }
      
      if (name === 'crossChainInsurance') {
        console.log('🧪 Testing SimpleCrossChainInsurance functions:');
        
        try {
          // Test priceMonitor address (this should work)
          const priceMonitorAddr = await contract.priceMonitor();
          console.log(`✅ priceMonitor(): ${priceMonitorAddr}`);
        } catch (error) {
          console.log(`❌ priceMonitor() failed: ${error.message}`);
        }

        try {
          // Test usdcManager address
          const usdcManagerAddr = await contract.usdcManager();
          console.log(`✅ usdcManager(): ${usdcManagerAddr}`);
        } catch (error) {
          console.log(`❌ usdcManager() failed: ${error.message}`);
        }

        try {
          // Test layerZeroEndpoint
          const lzEndpoint = await contract.layerZeroEndpoint();
          console.log(`✅ layerZeroEndpoint(): ${lzEndpoint}`);
        } catch (error) {
          console.log(`❌ layerZeroEndpoint() failed: ${error.message}`);
        }

        try {
          // Test getSupportedChains (this should work)
          const supportedChains = await contract.getSupportedChains();
          console.log(`✅ getSupportedChains(): ${supportedChains.toString()}`);
        } catch (error) {
          console.log(`❌ getSupportedChains() failed: ${error.message}`);
        }

        try {
          // Test userClaimCount
          const claimCount = await contract.userClaimCount(signer.address);
          console.log(`✅ userClaimCount(${signer.address}): ${claimCount.toString()}`);
        } catch (error) {
          console.log(`❌ userClaimCount() failed: ${error.message}`);
        }
      }
      
      if (name === 'priceMonitor') {
        console.log('🧪 Testing SimplePriceMonitor functions:');
        
        try {
          // Test owner (should work)
          const owner = await contract.owner();
          console.log(`✅ owner(): ${owner}`);
        } catch (error) {
          console.log(`❌ owner() failed: ${error.message}`);
        }

        try {
          // Test getProtocolAggregator with a dummy protocol ID
          const dummyProtocolId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ETH"));
          const aggregator = await contract.getProtocolAggregator(dummyProtocolId);
          console.log(`✅ getProtocolAggregator(ETH): ${aggregator}`);
        } catch (error) {
          console.log(`❌ getProtocolAggregator() failed: ${error.message}`);
        }

        try {
          // Test protocolStatus with a dummy protocol ID
          const dummyProtocolId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ETH"));
          const status = await contract.protocolStatus(dummyProtocolId);
          console.log(`✅ protocolStatus(ETH): ${status}`);
        } catch (error) {
          console.log(`❌ protocolStatus() failed: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${name}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Debug complete!');
  console.log('\n📋 Summary of ACTUAL available functions:');
  console.log('SimplePriceMonitor:');
  console.log('  ✅ owner(), addProtocol(), getLatestPrice(), checkProtocolHealth(), getProtocolAggregator()');
  console.log('  ❌ getProtocolCount() - DOES NOT EXIST');
  console.log('\nSimpleCrossChainInsurance:');
  console.log('  ✅ priceMonitor(), usdcManager(), getSupportedChains(), getClaim(), userClaimCount()');
  console.log('  ❌ getUserCoverage() - DOES NOT EXIST');
  console.log('\nUSDCManager:');
  console.log('  ✅ getPoolStats(), userDeposits(), usdcToken(), domain constants');
  console.log('  ⚠️ getPoolStats() may fail due to uninitialized state');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });