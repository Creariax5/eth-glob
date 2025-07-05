// Circle Configuration for CCTP (Pure JS - No SDK dependency)
const circleConfig = {
  testnet: {
    apiKey: process.env.CIRCLE_API_KEY || 'sandbox_key',
    baseUrl: 'https://api-sandbox.circle.com',
    
    // CCTP Domain IDs for testnets
    domains: {
      ethereum: 0,    // Ethereum Sepolia
      arbitrum: 3,    // Arbitrum Sepolia  
      base: 6         // Base Sepolia
    },
    
    // USDC contract addresses on testnets
    usdcContracts: {
      ethereum: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      arbitrum: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", 
      base: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
    },
    
    // Token Messenger contracts for CCTP
    tokenMessenger: {
      ethereum: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
      arbitrum: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
      base: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5"
    },
    
    // Chain RPC URLs (public endpoints)
    rpcUrls: {
      ethereum: "https://1rpc.io/sepolia",
      arbitrum: "https://sepolia-rollup.arbitrum.io/rpc",
      base: "https://sepolia.base.org"
    }
  }
};

module.exports = circleConfig;
