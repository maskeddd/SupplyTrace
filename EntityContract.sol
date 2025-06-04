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
     * @param entityType The type of the entity (e.g., "manufacturer", "producer")
     * @param isRegistered Whether the entity has completed registration
     * @param addresses Mapping of component addresses (e.g., "Mine X", "Factory Y", "Store Z")
     */
    struct Entity {
        string name;
        string entityType;
        bool isRegistered;
        mapping(string => bool) addresses;
    }

    /// @dev Maps Ethereum addresses to Entity structs
    mapping(address => Entity) public entities;

    /// @dev Stores all registered entity addresses
    address[] private registeredEntityAddresses;
    
    /// @dev Emitted when a new entity registers
    event EntityRegistered(address indexed entityAddress, string name, string entityType);
    
    /// @dev Emitted when an entity adds a new component address
    event ComponentAddressAdded(address indexed entityAddress, string componentAddress);
    
    /**
     * @dev Registers a new entity (manufacturer or primary producer)
     * @param _name The business name of the entity
     * @param _entityType The type of the entity (e.g., "manufacturer", "producer")
     * @notice Only unregistered addresses can call this function
     */
    function registerEntity(string memory _name, string memory _entityType) external {
        require(!entities[msg.sender].isRegistered, "Entity already registered");

        entities[msg.sender].name = _name;
        entities[msg.sender].entityType = _entityType;
        entities[msg.sender].isRegistered = true;

        registeredEntityAddresses.push(msg.sender);

        emit EntityRegistered(msg.sender, _name, _entityType);
    }

    /**
     * @dev Adds a component address to distinguish different parts of supply chain
     * @param _componentAddress String identifier for component (e.g., "Mine X", "Factory Y")
     * @notice Only registered entities can add component addresses
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

    /**
     * @dev Returns a list of all registered entity addresses
     * @return address[] memory List of entity addresses
     */
    function getRegisteredEntities() external view returns (address[] memory) {
        return registeredEntityAddresses;
    }
}
