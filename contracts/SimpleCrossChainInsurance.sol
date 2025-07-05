// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/utils/RateLimiter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleCrossChainInsurance 
 * @dev Minimal LayerZero OApp for cross-chain insurance claims
 * @dev Integrates with your existing PriceMonitor and USDCManager contracts
 */
contract SimpleCrossChainInsurance is OApp {
    
    // Events
    event CrossChainClaimInitiated(address indexed user, bytes32 indexed protocolId, uint256 amount, uint32 destChain);
    event CrossChainClaimReceived(address indexed user, bytes32 indexed protocolId, uint256 amount, uint32 srcChain);
    event ContractsConnected(address priceMonitor, address usdcManager);
    
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
    
    constructor(
        address _endpoint,
        address _owner,
        address _priceMonitor,
        address _usdcManager
    ) OApp(_endpoint, _owner) {
        priceMonitor = _priceMonitor;
        usdcManager = _usdcManager;
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
     */
    function initiateCrossChainClaim(
        address user,
        bytes32 protocolId,
        uint256 claimAmount,
        uint32 destChain
    ) external {
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
            sourceChain: destChain, // Will be current chain when received
            timestamp: block.timestamp,
            processed: false
        });
        
        userClaimCount[user]++;
        
        // Prepare cross-chain message
        bytes memory payload = abi.encode(claimId, user, protocolId, claimAmount);
        
        // Send cross-chain message via LayerZero
        _lzSend(
            destChain,
            payload,
            MessagingParams({
                gas: 200000,
                gasValue: 0,
                gasRecipient: address(0)
            }),
            payable(msg.sender)
        );
        
        emit CrossChainClaimInitiated(user, protocolId, claimAmount, destChain);
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
     * @dev Internal function to handle incoming LayerZero messages
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // Decode the cross-chain claim
        (bytes32 claimId, address user, bytes32 protocolId, uint256 amount) = 
            abi.decode(_message, (bytes32, address, bytes32, uint256));
        
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
                _origin.srcEid // Source chain for cross-chain reference
            )
        );
        
        require(success, "Cross-chain claim processing failed");
        
        emit CrossChainClaimReceived(user, protocolId, amount, _origin.srcEid);
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
     * @dev Estimate LayerZero messaging fee
     */
    function estimateFee(
        uint32 destChain,
        bytes memory payload
    ) external view returns (uint256 fee) {
        MessagingParams memory params = MessagingParams({
            gas: 200000,
            gasValue: 0,
            gasRecipient: address(0)
        });
        
        return _quote(destChain, payload, params, false).nativeFee;
    }
}