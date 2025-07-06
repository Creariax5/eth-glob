# 🛡️ YieldGuard - Cross-Chain DeFi Insurance Platform

**Secure DeFi yields with instant cross-chain insurance coverage powered by LayerZero, Chainlink, and Circle.**

YieldGuard revolutionizes DeFi risk management by providing seamless cross-chain insurance coverage for protocol participants. Users can either secure their investments with comprehensive insurance protection or earn premium income by providing coverage to others.

## ✨ Features

### 🔒 **Safe Pool Strategy**
- Deposit into high-yield DeFi protocols with 100% insurance coverage
- Automatic claim processing when protocols experience issues
- Cross-chain protection across Ethereum, Arbitrum, and Base

### ⚡ **Boosted Pool Strategy** 
- Provide insurance coverage and earn premium income
- Stack multiple protocol coverage for exponential yield potential
- Diversified risk exposure with transparent payout obligations

### 🌐 **Cross-Chain Infrastructure**
- Instant cross-chain insurance claims via LayerZero messaging
- Real-time protocol health monitoring with Chainlink price feeds
- Seamless USDC transfers using Circle's Cross-Chain Transfer Protocol (CCTP)

## 🏗️ Technology Stack

### **Core Integrations**

**🌉 LayerZero**
- OApp (Omnichain Application) contracts for cross-chain messaging
- Instant insurance claim processing across multiple chains
- Unified liquidity pools accessible from any supported network

**🔗 Chainlink**
- Real-time price feed monitoring for hack detection
- Cross-Chain Interoperability Protocol (CCIP) for state synchronization
- Automated protocol health assessments

**🔄 Circle**
- USDC as the primary insurance currency
- Cross-Chain Transfer Protocol (CCTP) for instant settlements
- Multi-chain liquidity management

### **Supporting Technologies**
- **Smart Contracts**: Solidity ^0.8.20
- **Frontend**: Vanilla JavaScript with Web3 integration
- **Networks**: Ethereum, Arbitrum, Base (Sepolia testnets)
- **Development**: Hardhat, OpenZeppelin

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MetaMask wallet
- Testnet ETH for gas fees
- Testnet USDC from [Circle Faucet](https://faucet.circle.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/yieldguard
cd yieldguard

# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to all testnets
npm run deploy:all
```

### Contract Deployment

Deploy to individual networks:
```bash
npm run deploy:ethereum    # Ethereum Sepolia
npm run deploy:arbitrum    # Arbitrum Sepolia  
npm run deploy:base        # Base Sepolia
```

## 🖥️ Demo Usage

### Live Demo Setup

1. **Open the Demo**
   ```bash
   # Serve the demo locally
   npx serve .
   # Or simply open index.html in your browser
   ```

2. **Connect Your Wallet**
   - Install MetaMask and connect to Sepolia testnet
   - Ensure you have testnet ETH for gas fees

3. **Get Testnet USDC**
   - Visit [Circle's Testnet Faucet](https://faucet.circle.com/)
   - Request USDC for your wallet address

### Demo Flow

#### **Option 1: Full Insurance Demo**
1. **Setup**: Connect wallet → Load contracts → Check USDC balance
2. **Approve**: Click "Approve USDC Spending" (one-time setup)
3. **Purchase Insurance**: Select protocol, coverage amount, and premium
4. **Test Claims**: Trigger cross-chain emergency claim simulation

#### **Option 2: Quick Integration Demo**
1. **Connect**: Wallet connection → Auto-load contracts
2. **Verify**: Check pool statistics (proves contract integration)
3. **Test**: Trigger cross-chain claim (demonstrates LayerZero)

### Expected Demo Behavior

- ✅ **Pool Statistics**: Shows live contract data from all chains
- ✅ **USDC Integration**: Balance checks and approval workflow
- ✅ **Insurance Purchase**: Real transactions with Circle USDC
- ✅ **Cross-Chain Claims**: LayerZero messaging (may show access control messages)

> **Note**: The demo uses proper access control patterns. Some functions may return "Only PriceMonitor can initiate claims" - this is expected behavior demonstrating security implementation.

## 🏛️ Architecture Overview

### Smart Contract Architecture

```
contracts/
├── SimplePriceMonitor.sol        # Chainlink price feed integration
├── USDCManager.sol              # Circle CCTP & insurance logic  
└── SimpleCrossChainInsurance.sol # LayerZero OApp messaging
```

### Cross-Chain Flow

1. **Protocol Monitoring**: Chainlink price feeds detect protocol issues
2. **Claim Initiation**: PriceMonitor triggers cross-chain claims
3. **Message Relay**: LayerZero handles cross-chain communication
4. **Settlement**: Circle CCTP processes instant USDC payouts

### Supported Networks

| Network | Chain ID | LayerZero ID | Status |
|---------|----------|--------------|--------|
| Ethereum Sepolia | 11155111 | 40161 | ✅ Deployed |
| Arbitrum Sepolia | 421614 | 40231 | ✅ Deployed |
| Base Sepolia | 84532 | 40245 | ✅ Deployed |

## 💡 Innovation Highlights

### **Omnichain Insurance**
First-of-its-kind cross-chain insurance primitive enabling users to insure DeFi positions across any supported network while maintaining unified liquidity pools.

### **Real-Time Risk Assessment**
Chainlink price feeds provide continuous protocol health monitoring, enabling instant claim processing when issues are detected.

### **Instant Cross-Chain Settlement**
Circle's CCTP ensures insurance payouts are processed instantly across chains without traditional bridging delays or additional fees.

## 🧪 Testing

### Run Integration Tests
```bash
# Test individual contracts
npm run test:priceMonitor
npm run test:usdcManager
npm run test:crossChain

# Full integration test
npm run test:integration
```

### Verify Deployments
```bash
# Check deployment status
ls deployments/

# Verify contracts on testnet
npm run verify:all
```

## 📜 Contract Functions

### **USDCManager**
- `purchaseInsurance(protocolId, coverageAmount, premiumAmount)` - Buy insurance coverage
- `depositUSDC(amount, destinationDomain)` - Deposit with optional cross-chain transfer
- `getPoolStats()` - Retrieve live pool statistics

### **SimpleCrossChainInsurance**
- `initiateCrossChainClaim(user, protocolId, amount, destChain)` - Trigger cross-chain claims
- `checkProtocolHealthCrossChain(protocolId)` - Monitor protocol status

### **SimplePriceMonitor**
- `checkProtocolHealth(protocolId)` - Assess protocol risk levels
- `addProtocol(protocolId, aggregator)` - Register new protocols

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install dev dependencies
npm install

# Run local blockchain
npx hardhat node

# Deploy to local network
npm run deploy:local
```

## 🔗 Links

- **Demo**: [Live Demo](https://yieldguard.vercel.com)
- **LayerZero**: [Omnichain Applications](https://layerzero.network/)
- **Chainlink**: [Cross-Chain Infrastructure](https://chain.link/)
- **Circle**: [USDC & CCTP](https://www.circle.com/usdc)

---
