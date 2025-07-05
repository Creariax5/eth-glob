// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleCrossChainInsurance 
 * @dev Simplified cross-chain insurance claims manager
 * @dev Integrates with your existing PriceMonitor and USDCManager contracts
 * @dev NOTE: Simplified for quick deployment - LayerZero integration can be added later
 */
contract SimpleCrossChainInsurance is Ownable {
    
    // Events
    event CrossChainClaimInitiated(address indexed user, bytes32 indexed protocolId, uint256 amount, uint32 destChain);
    event CrossChainClaimReceived(address indexed user, bytes32 indexed protocolId, uint256 amount, uint32 srcChain);
    event ContractsConnected(address priceMonitor, address usdcManager);
    event LayerZeroMessageSent(uint32 destChain, bytes payload, uint256 fee);
    
    // Connected contracts (your existing ones)
    address public priceMonitor;
    address public usdcManager;
    
    // Cross-chain claim tracking
    struct CrossChainClaim {
        address user;
        bytes32 protocolId;
        uint256 amount;
        uint32 sourceChain;
        uint256 timestamp;
        bool processed;
    }
    
    mapping(bytes32 => CrossChainClaim) public crossChainClaims;
    mapping(address => uint256) public userClaimCount;
    
    // Chain configuration
    mapping(uint32 => bool) public supportedChains;
    
    // LayerZero configuration (for bounty demonstration)
    address public layerZeroEndpoint;
    
    // LayerZero chain IDs for demonstration
    uint32 public constant ETHEREUM_SEPOLIA_LZ_ID = 40161;
    uint32 public constant ARBITRUM_SEPOLIA_LZ_ID = 40231;
    uint32 public constant BASE_SEPOLIA_LZ_ID = 40245;
    
    constructor(
        address _endpoint,
        address _priceMonitor,
        address _usdcManager
    ) Ownable(msg.sender) {
        layerZeroEndpoint = _endpoint;
        priceMonitor = _priceMonitor;
        usdcManager = _usdcManager;
        
        // Initialize supported chains for bounty demo
        supportedChains[ETHEREUM_SEPOLIA_LZ_ID] = true;
        supportedChains[ARBITRUM_SEPOLIA_LZ_ID] = true;
        supportedChains[BASE_SEPOLIA_LZ_ID] = true;
        
        emit ContractsConnected(_priceMonitor, _usdcManager);
    }
    
    /**
     * @dev Connect your existing contracts
     */
    function updateContracts(address _priceMonitor, address _usdcManager) external onlyOwner {
        priceMonitor = _priceMonitor;
        usdcManager = _usdcManager;
        emit ContractsConnected(_priceMonitor, _usdcManager);
    }
    
    /**
     * @dev Add supported destination chains
     */
    function addSupportedChain(uint32 _chainId) external onlyOwner {
        supportedChains[_chainId] = true;
    }
    
    /**
     * @dev Initiate cross-chain insurance claim 
     * @dev Called when your PriceMonitor detects a protocol hack
     * @dev SIMPLIFIED VERSION - demonstrates LayerZero integration concept
     */
    function initiateCrossChainClaim(
        address user,
        bytes32 protocolId,
        uint256 claimAmount,
        uint32 destChain
    ) external payable {
        require(msg.sender == priceMonitor, "Only PriceMonitor can initiate claims");
        require(supportedChains[destChain], "Destination chain not supported");
        require(claimAmount > 0, "Claim amount must be greater than 0");
        
        // Create unique claim ID
        bytes32 claimId = keccak256(abi.encodePacked(user, protocolId, block.timestamp, userClaimCount[user]));
        
        // Store claim data
        crossChainClaims[claimId] = CrossChainClaim({
            user: user,
            protocolId: protocolId,
            amount: claimAmount,
            sourceChain: destChain,
            timestamp: block.timestamp,
            processed: false
        });
        
        userClaimCount[user]++;
        
        // Prepare cross-chain message
        bytes memory payload = abi.encode(claimId, user, protocolId, claimAmount);
        
        // SIMPLIFIED: Emit event to demonstrate LayerZero integration
        // In full implementation, this would call LayerZero's _lzSend
        emit LayerZeroMessageSent(destChain, payload, msg.value);
        emit CrossChainClaimInitiated(user, protocolId, claimAmount, destChain);
    }
    
    /**
     * @dev Process cross-chain claim (simulated for bounty demo)
     * @dev In full implementation, this would be called by LayerZero _lzReceive
     */
    function simulateReceiveCrossChainClaim(
        bytes32 claimId,
        address user,
        bytes32 protocolId,
        uint256 amount,
        uint32 srcChain
    ) external onlyOwner {
        // Verify claim hasn't been processed
        require(!crossChainClaims[claimId].processed, "Claim already processed");
        
        // Update claim as processed
        crossChainClaims[claimId].processed = true;
        
        // Process the payout via your USDCManager
        (bool success, ) = usdcManager.call(
            abi.encodeWithSignature(
                "processClaimPayout(address,uint256,uint32)",
                user,
                amount,
                srcChain
            )
        );
        
        require(success, "Cross-chain claim processing failed");
        
        emit CrossChainClaimReceived(user, protocolId, amount, srcChain);
    }
    
    /**
     * @dev Process insurance claim locally (single chain)
     * @dev Interfaces with your USDCManager for payouts
     */
    function processLocalClaim(
        address user,
        bytes32 protocolId,
        uint256 claimAmount
    ) external {
        require(msg.sender == priceMonitor, "Only PriceMonitor can process claims");
        
        // Call your existing USDCManager to process payout
        (bool success, ) = usdcManager.call(
            abi.encodeWithSignature(
                "processClaimPayout(address,uint256,uint32)",
                user,
                claimAmount,
                0 // Local domain (no cross-chain)
            )
        );
        
        require(success, "Local claim processing failed");
    }
    
    /**
     * @dev Get claim details
     */
    function getClaim(bytes32 claimId) external view returns (CrossChainClaim memory) {
        return crossChainClaims[claimId];
    }
    
    /**
     * @dev Emergency function to check protocol health across chains
     * @dev Interfaces with your PriceMonitor
     */
    function checkProtocolHealthCrossChain(bytes32 protocolId) external view returns (bool) {
        (bool success, bytes memory result) = priceMonitor.staticcall(
            abi.encodeWithSignature("checkProtocolHealth(bytes32)", protocolId)
        );
        
        if (success && result.length > 0) {
            return abi.decode(result, (bool));
        }
        
        return false; // Default to unhealthy if can't check
    }
    
    /**
     * @dev Estimate LayerZero messaging fee (simplified for demo)
     */
    function estimateFee(
        uint32 destChain,
        bytes memory payload
    ) external pure returns (uint256 fee) {
        // Simplified fee calculation for demo
        // In real implementation, this would call LayerZero's quote function
        return 0.001 ether + (payload.length * 1000); // Basic fee structure
    }
    
    /**
     * @dev Get supported LayerZero chains (for frontend)
     */
    function getSupportedChains() external pure returns (uint32[] memory) {
        uint32[] memory chains = new uint32[](3);
        chains[0] = ETHEREUM_SEPOLIA_LZ_ID;
        chains[1] = ARBITRUM_SEPOLIA_LZ_ID;
        chains[2] = BASE_SEPOLIA_LZ_ID;
        return chains;
    }
    
    /**
     * @dev Emergency withdraw function
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH for LayerZero fees
     */
    receive() external payable {}
}