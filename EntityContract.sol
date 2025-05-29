// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title EntityContract
 * @dev Manages registration of manufacturers and primary producers in the supply chain
 * @notice This contract stores PUBLIC data about supply chain participants (excluding consumers)
 */
contract EntityContract {
    
    /**
     * @dev Represents a registered entity in the supply chain
     * @param name The business name of the entity
     * @param isRegistered Whether the entity has completed registration
     * @param addresses Mapping of component addresses (e.g., "Mine X", "Factory Y", "Store Z")
     */
    struct Entity {
        string name;
        bool isRegistered;
        mapping(string => bool) addresses; // component addresses (Mine X, Factory Y, etc.)
    }
    
    /// @dev Maps Ethereum addresses to Entity structs
    mapping(address => Entity) public entities;
    
    /// @dev Emitted when a new entity registers
    event EntityRegistered(address indexed entityAddress, string name);
    
    /// @dev Emitted when an entity adds a new component address
    event ComponentAddressAdded(address indexed entityAddress, string componentAddress);
    
    /**
     * @dev Registers a new entity (manufacturer or primary producer)
     * @param _name The business name of the entity
     * @notice Only unregistered addresses can call this function
     * @notice Each Ethereum address can only register once
     */
    function registerEntity(string memory _name) external {
        require(!entities[msg.sender].isRegistered, "Entity already registered");
        
        entities[msg.sender].name = _name;
        entities[msg.sender].isRegistered = true;
        
        emit EntityRegistered(msg.sender, _name);
    }
    
    /**
     * @dev Adds a component address to distinguish different parts of supply chain
     * @param _componentAddress String identifier for component (e.g., "Mine X", "Factory Y")
     * @notice Only registered entities can add component addresses
     * @notice Used to track different locations/facilities within an entity's operations
     */
    function addComponentAddress(string memory _componentAddress) external {
        require(entities[msg.sender].isRegistered, "Entity not registered");
        
        entities[msg.sender].addresses[_componentAddress] = true;
        
        emit ComponentAddressAdded(msg.sender, _componentAddress);
    }
    
    /**
     * @dev Checks if an Ethereum address is a registered entity
     * @param _entity The Ethereum address to check
     * @return bool True if the address is registered, false otherwise
     * @notice Used by other contracts to verify entity registration status
     */
    function isEntityRegistered(address _entity) external view returns (bool) {
        return entities[_entity].isRegistered;
    }
    
    /**
     * @dev Checks if an entity has a specific component address
     * @param _entity The Ethereum address of the entity
     * @param _componentAddress The component address to check
     * @return bool True if the entity has this component address, false otherwise
     */
    function hasComponentAddress(address _entity, string memory _componentAddress) external view returns (bool) {
        return entities[_entity].addresses[_componentAddress];
    }
}