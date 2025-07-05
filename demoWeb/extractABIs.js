// extractABIs.js - Extract ABIs for frontend integration
const fs = require('fs');
const path = require('path');

async function extractABIs() {
    console.log('📋 Extracting Contract ABIs for Frontend...');
    
    // Contract artifact paths
    const contracts = [
        'SimplePriceMonitor',
        'USDCManager', 
        'SimpleCrossChainInsurance'
    ];
    
    const abis = {};
    
    try {
        for (const contractName of contracts) {
            const artifactPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
            
            if (fs.existsSync(artifactPath)) {
                const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
                abis[contractName] = artifact.abi;
                console.log(`✅ Extracted ABI for ${contractName}`);
            } else {
                console.log(`⚠️  ${contractName} artifact not found - compile contracts first`);
            }
        }
        
        // Add USDC ABI (standard ERC20)
        abis.USDC = [
            "function balanceOf(address account) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function name() view returns (string)"
        ];
        
        // Save ABIs to frontend
        const abiContent = `// Auto-generated Contract ABIs
export const CONTRACT_ABIS = ${JSON.stringify(abis, null, 2)};

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const CONTRACT_ADDRESSES = {
    ethereum: {
        priceMonitor: "0x98f29347f118f40d89d80AfAbf3a8b20B56aBBAf",
        usdcManager: "0x27f81Ee57CC39977c8b18de67BCc570eea5B673A",
        crossChainInsurance: "0xE5935e5F26947dD2C28A753bAB856C0253768082",
        usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // Sepolia USDC
    },
    arbitrum: {
        priceMonitor: "0x...",
        usdcManager: "0x...", 
        crossChainInsurance: "0x...",
        usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" // Arbitrum Sepolia USDC
    },
    base: {
        priceMonitor: "0x...",
        usdcManager: "0x...",
        crossChainInsurance: "0x...",
        usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" // Base Sepolia USDC
    }
};

// Chain configurations
export const CHAIN_CONFIG = {
    ethereum: {
        chainId: '0xaa36a7', // Sepolia
        name: 'Ethereum Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
        explorer: 'https://sepolia.etherscan.io'
    },
    arbitrum: {
        chainId: '0x66eee', // Arbitrum Sepolia  
        name: 'Arbitrum Sepolia',
        rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
        explorer: 'https://sepolia.arbiscan.io'
    },
    base: {
        chainId: '0x14a34', // Base Sepolia
        name: 'Base Sepolia', 
        rpcUrl: 'https://sepolia.base.org',
        explorer: 'https://sepolia.basescan.org'
    }
};`;
        
        fs.writeFileSync('contract-config.js', abiContent);
        console.log('💾 Contract configuration saved to contract-config.js');
        
        // Also create a deployment info template
        const deploymentTemplate = {
            instructions: "Run deployment script and update addresses below",
            networks: {
                ethereum: {
                    chainId: 11155111,
                    contracts: {
                        priceMonitor: "0x...",
                        usdcManager: "0x...", 
                        crossChainInsurance: "0x..."
                    },
                    deployed: false
                },
                arbitrum: {
                    chainId: 421614,
                    contracts: {
                        priceMonitor: "0x...",
                        usdcManager: "0x...",
                        crossChainInsurance: "0x..."
                    },
                    deployed: false
                },
                base: {
                    chainId: 84532,
                    contracts: {
                        priceMonitor: "0x...",
                        usdcManager: "0x...",
                        crossChainInsurance: "0x..."
                    },
                    deployed: false
                }
            }
        };
        
        fs.writeFileSync('deployment-addresses.json', JSON.stringify(deploymentTemplate, null, 2));
        console.log('📋 Deployment template saved to deployment-addresses.json');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Deploy contracts: npm run deploy:all');
        console.log('2. Update addresses in contract-config.js');
        console.log('3. Include contract-config.js in your HTML');
        console.log('4. Test frontend integration!');
        
    } catch (error) {
        console.error('❌ Error extracting ABIs:', error);
        console.log('💡 Make sure to compile contracts first: npx hardhat compile');
    }
}

// Run if called directly
if (require.main === module) {
    extractABIs();
}

module.exports = { extractABIs };