// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./EntityContract.sol";

/**
 * @title ProvenanceContract
 * @dev Tracks product lifecycle and interactions between primary producers and manufacturers
 * @notice Handles component registration, transfers, good creation, and internal movement tracking
 */
contract ProvenanceContract {
    /// @dev Reference to the EntityContract for verification
    EntityContract public entityContract;
    
    /**
     * @dev Represents a raw component produced by primary producers
     * @param producer Ethereum address of the primary producer
     * @param location Geographic location where component was produced
     * @param timestamp When the component was registered
     * @param exists Whether this component record exists (for validation)
     */
    struct Component {
        address producer;
        string location;
        uint256 timestamp;
        bool exists;
    }
    
    /**
     * @dev Represents a manufactured good with physical ID
     * @param manufacturer Ethereum address of the manufacturer
     * @param physicalId Physical identifier attached to the good (e.g., serial number, QR code)
     * @param componentIds Array of component IDs used to create this good
     * @param location Original manufacturing location
     * @param timestamp When the good was created
     * @param currentLocation Current location for internal movement tracking
     * @param exists Whether this good record exists (for validation)
     */
    struct Good {
        address manufacturer;
        string physicalId;
        uint256[] componentIds;
        string location;
        uint256 timestamp;
        string currentLocation; // for internal movement
        bool exists;
    }
    
    /// @dev Maps component IDs to Component structs
    mapping(uint256 => Component) public components;
    
    /// @dev Maps good IDs to Good structs
    mapping(uint256 => Good) public goods;
    
    /// @dev Tracks component transfers: componentId => recipient => hasReceived
    mapping(uint256 => mapping(address => bool)) public componentTransfers;
    
    /// @dev Auto-incrementing ID for new components
    uint256 public nextComponentId = 1;
    
    /// @dev Auto-incrementing ID for new goods
    uint256 public nextGoodId = 1;
    
    /// @dev Emitted when a primary producer registers a new component
    event ComponentRegistered(uint256 indexed componentId, address indexed producer, string location);
    
    /// @dev Emitted when a component is transferred between entities
    event ComponentTransferred(uint256 indexed componentId, address indexed from, address indexed to);
    
    /// @dev Emitted when a manufacturer creates a new good
    event GoodRegistered(uint256 indexed goodId, address indexed manufacturer, string physicalId);
    
    /// @dev Emitted when a good's location is updated for internal movement
    event GoodMoved(uint256 indexed goodId, string newLocation);
    
    /**
     * @dev Constructor sets the EntityContract address for verification
     * @param _entityContract Address of the deployed EntityContract
     */
    constructor(address _entityContract) {
        entityContract = EntityContract(_entityContract);
    }
    
    /**
     * @dev Allows primary producers to register new components
     * @param _location Geographic location where component was produced
     * @return uint256 The ID assigned to the new component
     * @notice Only registered entities can register components
     * @notice Creates a permanent record of component origin
     */
    function registerComponent(string memory _location) external returns (uint256) {
        require(entityContract.isEntityRegistered(msg.sender), "Producer not registered");
        
        uint256 componentId = nextComponentId++;
        components[componentId] = Component({
            producer: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit ComponentRegistered(componentId, msg.sender, _location);
        return componentId;
    }
    
    /**
     * @dev Transfers component ownership from producer to manufacturer
     * @param _componentId ID of the component to transfer
     * @param _to Ethereum address of the recipient (must be registered entity)
     * @notice Only the original producer can transfer their components
     * @notice Recipient must be a registered entity
     * @notice Records the transfer for later verification during good creation
     */
    function transferComponent(uint256 _componentId, address _to) external {
        require(components[_componentId].exists, "Component does not exist");
        require(components[_componentId].producer == msg.sender, "Not component owner");
        require(entityContract.isEntityRegistered(_to), "Recipient not registered");
        
        componentTransfers[_componentId][_to] = true;
        
        emit ComponentTransferred(_componentId, msg.sender, _to);
    }
    
    /**
     * @dev Creates a new manufactured good from received components
     * @param _physicalId Physical identifier attached to the good (serial number, QR code, etc.)
     * @param _componentIds Array of component IDs used to create this good
     * @param _location Manufacturing location
     * @return uint256 The ID assigned to the new good
     * @notice Only registered manufacturers can create goods
     * @notice All specified components must have been transferred to the manufacturer
     * @notice Links manufactured goods to their source components for full traceability
     */
    function registerGood(
        string memory _physicalId,
        uint256[] memory _componentIds,
        string memory _location
    ) external returns (uint256) {
        require(entityContract.isEntityRegistered(msg.sender), "Manufacturer not registered");
        
        // Verify manufacturer received all components
        for (uint256 i = 0; i < _componentIds.length; i++) {
            require(components[_componentIds[i]].exists, "Component does not exist");
            require(componentTransfers[_componentIds[i]][msg.sender], "Component not transferred to manufacturer");
        }
        
        uint256 goodId = nextGoodId++;
        goods[goodId] = Good({
            manufacturer: msg.sender,
            physicalId: _physicalId,
            componentIds: _componentIds,
            location: _location,
            timestamp: block.timestamp,
            currentLocation: _location,
            exists: true
        });
        
        emit GoodRegistered(goodId, msg.sender, _physicalId);
        return goodId;
    }
    
    /**
     * @dev Updates the current location of a good for internal movement tracking
     * @param _goodId ID of the good to move
     * @param _newLocation New location string (e.g., "Factory X to Store Y")
     * @notice Only the original manufacturer can update good locations
     * @notice Used for tracking internal movement within manufacturer's operations
     * @notice Does not change ownership, only location for logistics tracking
     */
    function updateGoodLocation(uint256 _goodId, string memory _newLocation) external {
        require(goods[_goodId].exists, "Good does not exist");
        require(goods[_goodId].manufacturer == msg.sender, "Not good manufacturer");
        
        goods[_goodId].currentLocation = _newLocation;
        
        emit GoodMoved(_goodId, _newLocation);
    }
    
    /**
     * @dev Checks if a good exists in the system
     * @param _goodId ID of the good to check
     * @return bool True if the good exists, false otherwise
     * @notice Used by MarketplaceContract to verify good existence before ownership transfer
     */
    function goodExists(uint256 _goodId) external view returns (bool) {
        return goods[_goodId].exists;
    }

    function getComponentsByOwner(address owner) public view returns (Component[] memory) {
        return ownerToComponents[owner];
    }

}
