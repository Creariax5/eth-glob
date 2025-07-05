// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Circle TokenMessenger interface for CCTP
interface ITokenMessenger {
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce);
    
    function replaceDepositForBurn(
        bytes calldata originalMessage,
        bytes calldata originalAttestation,
        bytes32 newDestinationCaller,
        bytes32 newMintRecipient
    ) external;
}

// Circle MessageTransmitter interface
interface IMessageTransmitter {
    function receiveMessage(bytes calldata message, bytes calldata attestation)
        external
        returns (bool success);
    
    function usedNonces(bytes32 hashOfMessage) external view returns (bool);
}

/**
 * @title USDCManager
 * @dev Manages USDC deposits, withdrawals, and cross-chain transfers for insurance
 * @notice Integrates with Circle's CCTP for cross-chain USDC transfers
 */
contract USDCManager is Ownable {
    // Events
    event USDCDeposited(address indexed user, uint256 amount, uint32 destinationDomain);
    event ClaimPayoutInitiated(address indexed user, uint256 amount, uint32 destinationDomain, uint64 nonce);
    event ClaimPayoutCompleted(address indexed user, uint256 amount, bytes32 messageHash);
    event CrossChainTransferInitiated(uint256 amount, uint32 destinationDomain, bytes32 recipient, uint64 nonce);
    event CrossChainTransferCompleted(bytes32 messageHash, address recipient, uint256 amount);
    event PremiumPaid(address indexed user, bytes32 indexed protocolId, uint256 amount);
    
    // Structs
    struct InsuranceCoverage {
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 lastPremiumPayment;
        bool isActive;
        bytes32 protocolId;
    }
    
    struct PendingClaim {
        address user;
        uint256 amount;
        uint32 destinationDomain;
        uint64 nonce;
        bool isCompleted;
        uint256 timestamp;
    }
    
    // State variables
    IERC20 public usdcToken;
    ITokenMessenger public tokenMessenger;
    IMessageTransmitter public messageTransmitter;
    address public priceMonitor;
    
    // Domain IDs for CCTP
    uint32 public constant ETHEREUM_DOMAIN = 0;
    uint32 public constant ARBITRUM_DOMAIN = 3;
    uint32 public constant BASE_DOMAIN = 6;
    
    // User data
    mapping(address => mapping(bytes32 => InsuranceCoverage)) public userCoverage;
    mapping(address => uint256) public userDeposits;
    mapping(uint64 => PendingClaim) public pendingClaims;
    mapping(bytes32 => bool) public processedMessages;
    
    // Insurance pool
    uint256 public totalPoolBalance;
    uint256 public totalClaims;
    uint256 public totalPremiums;
    
    // Modifiers
    modifier onlyPriceMonitor() {
        require(msg.sender == priceMonitor, "Only price monitor can call");
        _;
    }
    
    modifier validDomain(uint32 domain) {
        require(
            domain == ETHEREUM_DOMAIN || 
            domain == ARBITRUM_DOMAIN || 
            domain == BASE_DOMAIN, 
            "Invalid domain"
        );
        _;
    }
    
    constructor(
        address _usdcToken,
        address _tokenMessenger,
        address _messageTransmitter,
        address _priceMonitor
    ) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC token");
        require(_tokenMessenger != address(0), "Invalid token messenger");
        require(_messageTransmitter != address(0), "Invalid message transmitter");
        
        usdcToken = IERC20(_usdcToken);
        tokenMessenger = ITokenMessenger(_tokenMessenger);
        messageTransmitter = IMessageTransmitter(_messageTransmitter);
        priceMonitor = _priceMonitor;
    }
    
    /**
     * @dev Deposit USDC and optionally bridge to another chain
     * @param amount Amount of USDC to deposit
     * @param destinationDomain Target chain domain (0 if staying on same chain)
     */
    function depositUSDC(uint256 amount, uint32 destinationDomain) 
        external 
        validDomain(destinationDomain) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        if (destinationDomain == 0) {
            // Stay on same chain
            userDeposits[msg.sender] += amount;
            totalPoolBalance += amount;
        } else {
            // Bridge to destination chain
            bytes32 mintRecipient = bytes32(uint256(uint160(msg.sender)));
            
            // Approve TokenMessenger to burn USDC
            usdcToken.approve(address(tokenMessenger), amount);
            
            // Initiate cross-chain transfer
            uint64 nonce = tokenMessenger.depositForBurn(
                amount,
                destinationDomain,
                mintRecipient,
                address(usdcToken)
            );
            
            emit CrossChainTransferInitiated(amount, destinationDomain, mintRecipient, nonce);
        }
        
        emit USDCDeposited(msg.sender, amount, destinationDomain);
    }
    
    /**
     * @dev Process claim payout to user
     * @param user User to pay out
     * @param amount Amount to pay
     * @param destinationDomain Chain to send payout to (0 for same chain)
     */
    function processClaimPayout(
        address user, 
        uint256 amount,
        uint32 destinationDomain
    ) external onlyPriceMonitor validDomain(destinationDomain) {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalPoolBalance >= amount, "Insufficient pool balance");
        
        if (destinationDomain == 0) {
            // Pay on same chain
            require(usdcToken.transfer(user, amount), "USDC transfer failed");
            
            userDeposits[user] -= amount;
            totalPoolBalance -= amount;
            totalClaims += amount;
            
            emit ClaimPayoutCompleted(user, amount, bytes32(0));
        } else {
            // Bridge payout to destination chain
            bytes32 mintRecipient = bytes32(uint256(uint160(user)));
            
            // Approve TokenMessenger to burn USDC
            usdcToken.approve(address(tokenMessenger), amount);
            
            // Initiate cross-chain payout
            uint64 nonce = tokenMessenger.depositForBurn(
                amount,
                destinationDomain,
                mintRecipient,
                address(usdcToken)
            );
            
            // Store pending claim
            pendingClaims[nonce] = PendingClaim({
                user: user,
                amount: amount,
                destinationDomain: destinationDomain,
                nonce: nonce,
                isCompleted: false,
                timestamp: block.timestamp
            });
            
            totalPoolBalance -= amount;
            totalClaims += amount;
            
            emit ClaimPayoutInitiated(user, amount, destinationDomain, nonce);
        }
    }
    
    /**
     * @dev Purchase insurance coverage for a protocol
     * @param protocolId Protocol to insure
     * @param coverageAmount Amount of coverage
     * @param premiumAmount Premium to pay
     */
    function purchaseInsurance(
        bytes32 protocolId,
        uint256 coverageAmount,
        uint256 premiumAmount
    ) external {
        require(coverageAmount > 0, "Coverage amount must be greater than 0");
        require(premiumAmount > 0, "Premium amount must be greater than 0");
        require(
            usdcToken.transferFrom(msg.sender, address(this), premiumAmount),
            "Premium payment failed"
        );
        
        InsuranceCoverage storage coverage = userCoverage[msg.sender][protocolId];
        coverage.coverageAmount += coverageAmount;
        coverage.premiumPaid += premiumAmount;
        coverage.lastPremiumPayment = block.timestamp;
        coverage.isActive = true;
        coverage.protocolId = protocolId;
        
        totalPoolBalance += premiumAmount;
        totalPremiums += premiumAmount;
        
        emit PremiumPaid(msg.sender, protocolId, premiumAmount);
    }
    
    /**
     * @dev Receive cross-chain message and complete transfer
     * @param message Cross-chain message
     * @param attestation Message attestation
     */
    function receiveMessage(bytes calldata message, bytes calldata attestation) 
        external 
        returns (bool) 
    {
        // Verify message hasn't been processed
        bytes32 messageHash = keccak256(message);
        require(!processedMessages[messageHash], "Message already processed");
        
        // Call Circle's MessageTransmitter
        bool success = messageTransmitter.receiveMessage(message, attestation);
        require(success, "Message verification failed");
        
        // Mark message as processed
        processedMessages[messageHash] = true;
        
        // Parse message to get recipient and amount (simplified)
        // In production, you'd properly decode the Circle message format
        
        emit CrossChainTransferCompleted(messageHash, msg.sender, 0);
        return true;
    }
    
    /**
     * @dev Get user's insurance coverage for a protocol
     * @param user User address
     * @param protocolId Protocol ID
     * @return coverage InsuranceCoverage struct
     */
    function getUserCoverage(address user, bytes32 protocolId) 
        external 
        view 
        returns (InsuranceCoverage memory coverage) 
    {
        return userCoverage[user][protocolId];
    }
    
    /**
     * @dev Get pending claim details
     * @param nonce Claim nonce
     * @return claim PendingClaim struct
     */
    function getPendingClaim(uint64 nonce) 
        external 
        view 
        returns (PendingClaim memory claim) 
    {
        return pendingClaims[nonce];
    }
    
    /**
     * @dev Get pool statistics
     * @return totalBalance Total pool balance
     * @return totalClaimsAmount Total claims paid
     * @return totalPremiumsCollected Total premiums collected
     */
    function getPoolStats() 
        external 
        view 
        returns (uint256 totalBalance, uint256 totalClaimsAmount, uint256 totalPremiumsCollected) 
    {
        return (totalPoolBalance, totalClaims, totalPremiums);
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= totalPoolBalance, "Insufficient balance");
        require(usdcToken.transfer(owner(), amount), "Transfer failed");
        
        totalPoolBalance -= amount;
    }
    
    /**
     * @dev Update price monitor address
     * @param newPriceMonitor New price monitor address
     */
    function updatePriceMonitor(address newPriceMonitor) external onlyOwner {
        require(newPriceMonitor != address(0), "Invalid address");
        priceMonitor = newPriceMonitor;
    }
    
    /**
     * @dev Update contract addresses
     * @param newTokenMessenger New token messenger address
     * @param newMessageTransmitter New message transmitter address
     */
    function updateContracts(
        address newTokenMessenger,
        address newMessageTransmitter
    ) external onlyOwner {
        if (newTokenMessenger != address(0)) {
            tokenMessenger = ITokenMessenger(newTokenMessenger);
        }
        if (newMessageTransmitter != address(0)) {
            messageTransmitter = IMessageTransmitter(newMessageTransmitter);
        }
    }
}