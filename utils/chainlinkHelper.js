const { ethers } = require('ethers');
const chainlinkConfig = require('../config/chainlink');

class ChainlinkHelper {
  constructor() {
    this.config = chainlinkConfig.testnet;
    
    // Chainlink AggregatorV3Interface ABI
    this.priceFeedABI = [
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      "function decimals() external view returns (uint8)",
      "function description() external view returns (string)",
      "function version() external view returns (uint256)",
      "function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
    ];
    
    // LINK Token ABI (minimal)
    this.linkTokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
  }

  async getLatestPrice(chainName, priceFeedPair) {
    try {
      const chainConfig = this.config[chainName];
      if (!chainConfig) {
        throw new Error(`Chain ${chainName} not supported`);
      }

      const priceFeedAddress = chainConfig.priceFeeds[priceFeedPair];
      if (!priceFeedAddress) {
        throw new Error(`Price feed ${priceFeedPair} not found for ${chainName}`);
      }

      const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      const priceFeed = new ethers.Contract(priceFeedAddress, this.priceFeedABI, provider);
      
      const [roundId, price, startedAt, updatedAt, answeredInRound] = await priceFeed.latestRoundData();
      const decimals = await priceFeed.decimals();
      const description = await priceFeed.description();
      
      return {
        pair: priceFeedPair,
        price: ethers.formatUnits(price, decimals),
        rawPrice: price,
        decimals: decimals,
        description: description,
        roundId: roundId,
        updatedAt: new Date(Number(updatedAt) * 1000),
        timeSinceUpdate: Date.now() - (Number(updatedAt) * 1000),
        chainName: chainName
      };
    } catch (error) {
      console.error(`Error getting price for ${priceFeedPair} on ${chainName}:`, error.message);
      return null;
    }
  }

  async getAllPricesForChain(chainName) {
    const chainConfig = this.config[chainName];
    if (!chainConfig) {
      throw new Error(`Chain ${chainName} not supported`);
    }

    const prices = [];
    const priceFeedPairs = Object.keys(chainConfig.priceFeeds);
    
    for (const pair of priceFeedPairs) {
      const priceData = await this.getLatestPrice(chainName, pair);
      if (priceData) {
        prices.push(priceData);
      }
    }
    
    return prices;
  }

  async checkPriceDeviation(chainName, priceFeedPair, referencePrice, thresholdPercent = 5) {
    const currentPriceData = await this.getLatestPrice(chainName, priceFeedPair);
    if (!currentPriceData) {
      return null;
    }

    const currentPrice = parseFloat(currentPriceData.price);
    const deviation = Math.abs((currentPrice - referencePrice) / referencePrice) * 100;
    
    return {
      pair: priceFeedPair,
      currentPrice: currentPrice,
      referencePrice: referencePrice,
      deviation: deviation,
      isTriggered: deviation > thresholdPercent,
      threshold: thresholdPercent,
      chainName: chainName
    };
  }

  async checkProtocolHealth(protocolName, chainName = 'ethereumSepolia') {
    const thresholds = chainlinkConfig.riskThresholds.protocols[protocolName];
    if (!thresholds) {
      throw new Error(`Protocol ${protocolName} not configured`);
    }

    // Get relevant price data for the protocol
    const ethPrice = await this.getLatestPrice(chainName, 'ETH/USD');
    const btcPrice = await this.getLatestPrice(chainName, 'BTC/USD');
    
    if (!ethPrice || !btcPrice) {
      return {
        protocol: protocolName,
        status: 'ERROR',
        message: 'Unable to fetch price data'
      };
    }

    // Check for price volatility (simplified check)
    const ethVolatility = ethPrice.timeSinceUpdate > 3600000; // More than 1 hour old
    const btcVolatility = btcPrice.timeSinceUpdate > 3600000;
    
    const healthStatus = {
      protocol: protocolName,
      chainName: chainName,
      status: 'HEALTHY',
      checks: {
        priceDataFresh: !ethVolatility && !btcVolatility,
        ethPrice: ethPrice.price,
        btcPrice: btcPrice.price,
        lastUpdate: Math.min(ethPrice.timeSinceUpdate, btcPrice.timeSinceUpdate)
      },
      thresholds: thresholds,
      riskLevel: 'LOW'
    };

    // Determine risk level based on data freshness
    if (ethVolatility || btcVolatility) {
      healthStatus.status = 'AT_RISK';
      healthStatus.riskLevel = 'MEDIUM';
    }

    return healthStatus;
  }

  async testConnection(chainName) {
    try {
      const chainConfig = this.config[chainName];
      if (!chainConfig) {
        return {
          success: false,
          error: `Chain ${chainName} not supported`
        };
      }

      const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      
      // Test basic connection
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      // Test LINK token connection
      let linkBalance = null;
      try {
        const linkToken = new ethers.Contract(chainConfig.linkToken, this.linkTokenABI, provider);
        const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Hardhat default
        const balance = await linkToken.balanceOf(testAddress);
        const decimals = await linkToken.decimals();
        linkBalance = ethers.formatUnits(balance, decimals);
      } catch (linkError) {
        console.warn(`Could not check LINK balance: ${linkError.message}`);
      }
      
      return {
        success: true,
        chainId: network.chainId,
        blockNumber: blockNumber,
        rpcUrl: chainConfig.rpcUrl,
        linkToken: chainConfig.linkToken,
        linkBalance: linkBalance,
        availablePriceFeeds: Object.keys(chainConfig.priceFeeds).length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getLinkBalance(chainName, address) {
    try {
      const chainConfig = this.config[chainName];
      const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      const linkToken = new ethers.Contract(chainConfig.linkToken, this.linkTokenABI, provider);
      
      const balance = await linkToken.balanceOf(address);
      const decimals = await linkToken.decimals();
      const symbol = await linkToken.symbol();
      
      return {
        balance: ethers.formatUnits(balance, decimals),
        raw: balance,
        decimals: decimals,
        symbol: symbol,
        chainName: chainName
      };
    } catch (error) {
      console.error(`Error getting LINK balance on ${chainName}:`, error.message);
      return null;
    }
  }

  // Helper methods
  getSupportedChains() {
    return Object.keys(this.config);
  }

  getSupportedPriceFeeds(chainName) {
    const chainConfig = this.config[chainName];
    return chainConfig ? Object.keys(chainConfig.priceFeeds) : [];
  }

  getChainConfig(chainName) {
    return this.config[chainName];
  }

  getRiskThresholds() {
    return chainlinkConfig.riskThresholds;
  }
}

module.exports = ChainlinkHelper;