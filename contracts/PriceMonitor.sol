// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simple interface definition to avoid import issues
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title SimplePriceMonitor
 * @dev Minimal price monitoring contract for testing
 */
contract SimplePriceMonitor {
    // Events
    event PriceChecked(address indexed aggregator, int256 price, uint256 timestamp);
    event ProtocolHealthChecked(bytes32 indexed protocolId, bool isHealthy);
    
    // Protocol data
    mapping(bytes32 => address) public protocolAggregators;
    mapping(bytes32 => bool) public protocolStatus;
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add a protocol price feed
     */
    function addProtocol(bytes32 protocolId, address aggregator) external onlyOwner {
        require(aggregator != address(0), "Invalid aggregator");
        protocolAggregators[protocolId] = aggregator;
        protocolStatus[protocolId] = true;
    }
    
    /**
     * @dev Get latest price from aggregator
     */
    function getLatestPrice(bytes32 protocolId) external view returns (int256) {
        address aggregator = protocolAggregators[protocolId];
        require(aggregator != address(0), "Protocol not found");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(aggregator);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        
        return price;
    }
    
    /**
     * @dev Check protocol health
     */
    function checkProtocolHealth(bytes32 protocolId) external returns (bool) {
        address aggregator = protocolAggregators[protocolId];
        require(aggregator != address(0), "Protocol not found");
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(aggregator);
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        
        bool isHealthy = (price > 0) && (block.timestamp - updatedAt < 3600); // 1 hour threshold
        
        emit PriceChecked(aggregator, price, updatedAt);
        emit ProtocolHealthChecked(protocolId, isHealthy);
        
        return isHealthy;
    }
    
    /**
     * @dev Get protocol aggregator address
     */
    function getProtocolAggregator(bytes32 protocolId) external view returns (address) {
        return protocolAggregators[protocolId];
    }
}