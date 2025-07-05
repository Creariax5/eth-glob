// Auto-generated Contract ABIs
export const CONTRACT_ABIS = {
  "USDC": [
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ]
};

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const CONTRACT_ADDRESSES = {
    ethereum: {
        priceMonitor: "0x...", // Update after deployment
        usdcManager: "0x...",
        crossChainInsurance: "0x...",
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
};