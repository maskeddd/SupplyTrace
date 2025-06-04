// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title Interface for EntityContract
 * @dev Allows ProvenanceContract to verify entity registration
 */
interface IEntityContract {
    function isEntityRegistered(address _entity) external view returns (bool);
}

/**
 * @title ProvenanceContract
 * @dev Tracks product lifecycle and interactions between primary producers and manufacturers
 * @notice Handles component registration, transfers, good creation, and internal movement tracking
 */
contract ProvenanceContract {
    // Reference to the EntityContract for access control
    IEntityContract public entityContract;

    constructor(address _entityContractAddress) {
        entityContract = IEntityContract(_entityContractAddress);
    }

    /**
     * @dev Modifier to restrict functions to registered entities only
     */
    modifier onlyRegisteredEntity() {
        require(entityContract.isEntityRegistered(msg.sender), "Access denied: Not a registered entity");
        _;
    }

    struct Component {
        string componentId;
        string location;
        uint256 timestamp;
        address owner;
    }

    struct Product {
        string productId;
        string name;
        string[] componentIds;
        uint256 timestamp;
        address owner;
    }

    struct OwnershipTransfer {
        address from;
        address to;
        uint256 timestamp;
    }

    mapping(address => Component[]) private componentsByOwner;
    mapping(address => Product[]) private productsByOwner;
    mapping(string => OwnershipTransfer[]) private ownershipHistory;
    mapping(address => Product[]) private finishedProductsByOwner;

    // 🆕 Mapping to store stolen status
    mapping(string => bool) private stolenStatus;

    // 🆕 Event for stolen marking
    event ProductMarkedStolen(string productId, address markedBy);

    /**
     * @notice Registers a new component under the sender's address
     * @param componentId Unique identifier of the component
     * @param location Where the component was produced
     */
    function registerComponent(string memory componentId, string memory location) public onlyRegisteredEntity {
        componentsByOwner[msg.sender].push(Component(componentId, location, block.timestamp, msg.sender));
    }

    /**
     * @notice Returns all components owned by a specific address
     * @param owner Address to query
     * @return List of Component structs
     */
    function getComponentsByOwner(address owner) public view returns (Component[] memory) {
        return componentsByOwner[owner];
    }

    /**
     * @notice Registers a new product assembled from multiple components
     * @param productId Unique identifier of the product
     * @param name Product name
     * @param componentIds List of component IDs used in the product
     */
    function registerProduct(
        string memory productId,
        string memory name,
        string[] memory componentIds
    ) public onlyRegisteredEntity {
        productsByOwner[msg.sender].push(Product(productId, name, componentIds, block.timestamp, msg.sender));
    }

    /**
     * @notice Fetches all products owned by the specified address
     * @param owner Address to query
     * @return List of Product structs
     */
    function getProductsByOwner(address owner) public view returns (Product[] memory) {
        return productsByOwner[owner];
    }

    /**
     * @notice Transfers product ownership to a new address
     * @param productId ID of the product being transferred
     * @param newOwner Ethereum address of the new owner
     */
    function transferOwnership(string memory productId, address newOwner) public onlyRegisteredEntity {
        bool found = false;
        Product[] storage products = productsByOwner[msg.sender];
        for (uint256 i = 0; i < products.length; i++) {
            if (keccak256(abi.encodePacked(products[i].productId)) == keccak256(abi.encodePacked(productId))) {
                Product memory product = products[i];

                products[i] = products[products.length - 1];
                products.pop();

                productsByOwner[newOwner].push(product);

                ownershipHistory[productId].push(OwnershipTransfer({
                    from: msg.sender,
                    to: newOwner,
                    timestamp: block.timestamp
                }));

                found = true;
                break;
            }
        }
        require(found, "Product not found");
    }

    /**
     * @notice Retrieves historical transfers of a product
     * @param productId ID of the product to look up
     * @return Array of OwnershipTransfer events
     */
    function getOwnershipHistory(string memory productId) public view returns (OwnershipTransfer[] memory) {
        return ownershipHistory[productId];
    }

    /**
     * @notice Registers a finished product made from component IDs
     * @param productId Unique identifier of the finished product
     * @param componentIds Array of component IDs included in the finished product
     */
    function registerFinishedProduct(string memory productId, string[] memory componentIds) public onlyRegisteredEntity {
        finishedProductsByOwner[msg.sender].push(Product({
            productId: productId,
            name: "",
            componentIds: componentIds,
            timestamp: block.timestamp,
            owner: msg.sender
        }));
    }

    /**
     * @notice Returns all finished products owned by a specific address
     * @param owner Wallet address to query
     * @return List of finished Product structs
     */
    function getFinishedProductsByOwner(address owner) public view returns (Product[] memory) {
        return finishedProductsByOwner[owner];
    }

    // 🆕 Mark a product as stolen
    function markAsStolen(string memory productId) public onlyRegisteredEntity {
        stolenStatus[productId] = true;
        emit ProductMarkedStolen(productId, msg.sender);
    }

    // 🆕 Check if a product is marked as stolen
    function isProductStolen(string memory productId) public view returns (bool) {
        return stolenStatus[productId];
    }
}
