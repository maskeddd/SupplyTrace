// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title EntityContract
 * @dev Responsible for managing the registration of entities such as
 * primary producers and manufacturers. It stores public data about these
 * entities, including their associated operational addresses (components).
 */
contract EntityContract {
    /**
     * @dev Represents a registered entity (e.g., manufacturer, primary producer).
     * @param owner The main Ethereum address of the entity.
     * @param componentAddresses An array of addresses representing different
     *                           operational units or "components" of the entity
     *                           (e.g., a specific mine, factory, or store).
     * @param componentDescriptions An array of strings describing each
     *                              corresponding componentAddress.
     * @param isRegistered A flag indicating if the entity is registered.
     */
    struct Entity {
        address owner;
        address[] componentAddresses;
        string[] componentDescriptions;
        bool isRegistered;
    }

    /**
     * @dev Mapping from an entity's main address to its Entity struct.
     * This mapping is public, allowing anyone to query entity data.
     */
    mapping(address => Entity) public entities;

    /**
     * @dev Emitted when a new entity successfully registers.
     * @param entityOwner The main address of the registered entity.
     * @param componentAddresses The list of component addresses for the entity.
     * @param componentDescriptions The descriptions for each component address.
     */
    event EntityRegistered(
        address indexed entityOwner,
        address[] componentAddresses,
        string[] componentDescriptions
    );

    /**
     * @dev Modifier to ensure a function is called by an address that has not
     * yet registered as an entity.
     */
    modifier notRegisteredYet() {
        require(
            !entities[msg.sender].isRegistered,
            "EntityContract: Entity already registered"
        );
        _;
    }

    /**
     * @notice Registers a new entity (manufacturer or primary producer).
     * The caller (msg.sender) becomes the owner of the entity.
     * @param _componentAddresses An array of Ethereum addresses representing
     *                            the different components of the entity (e.g.,
     *                            Mine X, Factory Y). Must not be empty and
     *                            must not contain zero addresses or duplicates.
     * @param _componentDescriptions An array of strings describing each
     *                               component address. Must match the length
     *                               of _componentAddresses.
     */
    function registerEntity(
        address[] memory _componentAddresses,
        string[] memory _componentDescriptions
    ) public notRegisteredYet {
        require(
            _componentAddresses.length == _componentDescriptions.length,
            "EntityContract: Addresses and descriptions length mismatch"
        );
        require(
            _componentAddresses.length > 0,
            "EntityContract: Must provide at least one component address"
        );

        for (uint i = 0; i < _componentAddresses.length; i++) {
            require(
                _componentAddresses[i] != address(0),
                "EntityContract: Component address cannot be the zero address"
            );
            // Check for duplicates within the provided component addresses
            for (uint j = i + 1; j < _componentAddresses.length; j++) {
                require(
                    _componentAddresses[i] != _componentAddresses[j],
                    "EntityContract: Duplicate component addresses provided"
                );
            }
        }

        entities[msg.sender] = Entity({
            owner: msg.sender,
            componentAddresses: _componentAddresses,
            componentDescriptions: _componentDescriptions,
            isRegistered: true
        });

        emit EntityRegistered(
            msg.sender,
            _componentAddresses,
            _componentDescriptions
        );
    }

    /**
     * @notice Checks if an address is registered as an entity owner.
     * @param _entityOwner The address to check.
     * @return bool True if the address is a registered entity owner, false otherwise.
     */
    function isEntityRegistered(address _entityOwner)
        public
        view
        returns (bool)
    {
        return entities[_entityOwner].isRegistered;
    }

    /**
     * @notice Retrieves the component addresses and descriptions for a registered entity.
     * @param _entityOwner The main address of the entity.
     * @return addresses_ An array of component addresses.
     * @return descriptions_ An array of component descriptions.
     */
    function getEntityComponents(address _entityOwner)
        public
        view
        returns (address[] memory addresses_, string[] memory descriptions_)
    {
        require(
            entities[_entityOwner].isRegistered,
            "EntityContract: Entity not registered"
        );
        Entity storage entity = entities[_entityOwner];
        return (entity.componentAddresses, entity.componentDescriptions);
    }

    /**
     * @notice Checks if a given address is a registered component of a specific entity.
     * @param _entityOwner The main address of the entity to check against.
     * @param _componentAddress The component address to verify.
     * @return bool True if _componentAddress is a registered component of _entityOwner,
     *         false otherwise.
     */
    function isComponentOfEntity(
        address _entityOwner,
        address _componentAddress
    ) public view returns (bool) {
        if (!entities[_entityOwner].isRegistered) {
            return false;
        }
        Entity storage entity = entities[_entityOwner];
        for (uint i = 0; i < entity.componentAddresses.length; i++) {
            if (entity.componentAddresses[i] == _componentAddress) {
                return true;
            }
        }
        return false;
    }
}
