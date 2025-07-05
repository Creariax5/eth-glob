const { ethers } = require('ethers');
const circleConfig = require('../config/circle');

class CCTPHelper {
  constructor() {
    this.config = circleConfig.testnet;
    
    // USDC ABI (minimal)
    this.usdcABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    
    // Token Messenger ABI (minimal for CCTP)
    this.tokenMessengerABI = [
      "function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) returns (uint64 nonce)",
      "function localMinter() view returns (address)"
    ];
  }

  async getUSDCBalance(chainName, address, customRpcUrl = null) {
    try {
      const rpcUrl = customRpcUrl || this.config.rpcUrls[chainName];
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      
      const usdcContract = new ethers.Contract(
        this.config.usdcContracts[chainName],
        this.usdcABI,
        provider
      );
      
      const balance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      const symbol = await usdcContract.symbol();
      
      return {
        balance: ethers.utils.formatUnits(balance, decimals),
        raw: balance,
        decimals: decimals,
        symbol: symbol
      };
    } catch (error) {
      console.error(`Error getting USDC balance on ${chainName}:`, error.message);
      return null;
    }
  }

  async testConnection(chainName) {
    try {
      const rpcUrl = this.config.rpcUrls[chainName];
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      
      // Test basic connection
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      return {
        success: true,
        chainId: network.chainId,
        blockNumber: blockNumber,
        rpcUrl: rpcUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getDomainId(chainName) {
    return this.config.domains[chainName];
  }

  getUSDCContract(chainName) {
    return this.config.usdcContracts[chainName];
  }

  getTokenMessenger(chainName) {
    return this.config.tokenMessenger[chainName];
  }

  // Helper to get all supported chains
  getSupportedChains() {
    return Object.keys(this.config.domains);
  }
}

module.exports = CCTPHelper;
