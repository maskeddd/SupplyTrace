// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title ProvenanceContract
 * @dev Tracks product lifecycle and interactions between primary producers and manufacturers
 * @notice Handles component registration, transfers, good creation, and internal movement tracking
 */
contract ProvenanceContract {
    /**
     * @dev Represents a raw component produced by primary producers
     * @param componentId Unique identifier for the component
     * @param location Geographic location where component was produced
     * @param timestamp When the component was registered
     * @param owner Ethereum address of the owner
     */
    struct Component {
        string componentId;
        string location;
        uint256 timestamp;
        address owner;
    }

    /**
     * @dev Represents a finished product manufactured from raw components
     * @param productId Unique identifier for the product
     * @param name Name of the product
     * @param componentIds Array of component IDs used to create the product
     * @param timestamp When the product was registered
     * @param owner Ethereum address of the owner
     */
    struct Product {
        string productId;
        string name;
        string[] componentIds;
        uint256 timestamp;
        address owner;
    }

    /**
     * @dev Records an ownership transfer event for auditing
     * @param from Previous owner's Ethereum address
     * @param to New owner's Ethereum address
     * @param timestamp When the transfer occurred
     */
    struct OwnershipTransfer {
        address from;
        address to;
        uint256 timestamp;
    }

    mapping(address => Component[]) private componentsByOwner;
    mapping(address => Product[]) private productsByOwner;
    mapping(string => OwnershipTransfer[]) private ownershipHistory;

    // New mapping for finished products
    mapping(address => Product[]) private finishedProductsByOwner;

    /**
     * @notice Registers a new component under the sender's address
     * @param componentId Unique identifier of the component
     * @param location Where the component was produced
     */
    function registerComponent(string memory componentId, string memory location) public {
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
    ) public {
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
    function transferOwnership(string memory productId, address newOwner) public {
        bool found = false;
        Product[] storage products = productsByOwner[msg.sender];
        for (uint256 i = 0; i < products.length; i++) {
            if (keccak256(abi.encodePacked(products[i].productId)) == keccak256(abi.encodePacked(productId))) {
                Product memory product = products[i];

                // Remove product from sender
                products[i] = products[products.length - 1];
                products.pop();

                // Assign to new owner
                productsByOwner[newOwner].push(product);

                // Record transfer history
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

    // Register Finished Product
    /**
     * @notice Registers a finished product made from component IDs
     * @param productId Unique identifier of the finished product
     * @param componentIds Array of component IDs included in the finished product
     */
    function registerFinishedProduct(string memory productId, string[] memory componentIds) public {
        finishedProductsByOwner[msg.sender].push(Product({
            productId: productId,
            name: "", // Optional: or set via additional parameter
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
}
