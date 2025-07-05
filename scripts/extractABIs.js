// Save this as scripts/extractABIs.js
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📄 Extracting ABIs from compiled contracts...');
  
  // Contract artifact paths (using actual contract names from your artifacts)
  const contracts = [
    {
      name: 'SimplePriceMonitor',  // Changed from PriceMonitor
      path: './artifacts/contracts/PriceMonitor.sol/SimplePriceMonitor.json'
    },
    {
      name: 'USDCManager', 
      path: './artifacts/contracts/USDCManager.sol/USDCManager.json'
    },
    {
      name: 'SimpleCrossChainInsurance',
      path: './artifacts/contracts/SimpleCrossChainInsurance.sol/SimpleCrossChainInsurance.json'
    }
  ];

  const extractedABIs = {};

  for (const contract of contracts) {
    try {
      if (fs.existsSync(contract.path)) {
        const artifact = JSON.parse(fs.readFileSync(contract.path, 'utf8'));
        extractedABIs[contract.name] = artifact.abi;
        console.log(`✅ Extracted ABI for ${contract.name}`);
        console.log(`   Functions: ${artifact.abi.filter(f => f.type === 'function').length}`);
      } else {
        console.log(`❌ Contract artifact not found: ${contract.path}`);
      }
    } catch (error) {
      console.error(`❌ Error reading ${contract.name}:`, error.message);
    }
  }

  // Save ABIs to frontend-accessible file
  const outputPath = './site/abis.js';
  const jsContent = `// Auto-generated ABIs - Do not edit manually
window.ContractABIs = ${JSON.stringify(extractedABIs, null, 2)};

console.log('✅ Contract ABIs loaded:', Object.keys(window.ContractABIs));
`;

  fs.writeFileSync(outputPath, jsContent);
  console.log(`💾 ABIs saved to ${outputPath}`);
  
  // Also save as JSON for reference
  fs.writeFileSync('./site/abis.json', JSON.stringify(extractedABIs, null, 2));
  console.log('💾 ABIs also saved as JSON for reference');

  console.log('\n🎯 Next steps:');
  console.log('1. Include site/abis.js in your HTML');
  console.log('2. Remove the manual ABI definitions from index.html');
  console.log('3. Test the contract calls');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });