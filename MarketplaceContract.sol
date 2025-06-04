// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ProvenanceContract.sol";

/**
 * @title MarketplaceContract
 * @dev Manages listing, sales, ownership, and stolen status of products on a decentralized marketplace
 * @notice Interacts with ProvenanceContract for ownership and theft checks
 */
contract MarketplaceContract {
    /// @dev Reference to the deployed ProvenanceContract
    ProvenanceContract public provenanceContract;

    /// @dev Struct representing a product listing
    struct Listing {
        address seller;
        uint256 price; // in wei
        bool isListed;
    }

    /// @dev Struct representing ownership and stolen status
    struct Ownership {
        address owner;
        bool isStolen;
    }

    /// @dev Maps productId to listing details
    mapping(string => Listing) public listings;

    /// @dev Maps productId to ownership and stolen status
    mapping(string => Ownership) public ownership;

    /// @dev Stores all currently listed product IDs
    string[] public listedProductIds;

    /// @dev Emitted when a product is listed for sale
    event ProductListed(string indexed productId, address indexed seller, uint256 price);

    /// @dev Emitted when ownership of a product changes
    event OwnershipTransferred(string indexed productId, address indexed from, address indexed to);

    /// @dev Emitted when a product is marked as stolen
    event GoodMarkedStolen(string indexed productId, address indexed reporter);

    /**
     * @dev Constructor
     * @param _provenanceContract Address of the deployed ProvenanceContract
     */
    constructor(address _provenanceContract) {
        provenanceContract = ProvenanceContract(_provenanceContract);
    }

    /**
     * @notice Lists a product for sale
     * @param _productId ID of the product to be listed
     * @param _price Sale price in wei
     * @dev Ownership is auto-inferred from ProvenanceContract if not explicitly set
     */
    function listProduct(string memory _productId, uint256 _price) external {
        require(_price > 0, "Price must be greater than 0");

        // Prevent listing stolen products
        require(!provenanceContract.isProductStolen(_productId), "Cannot list a stolen product");

        // Infer ownership if not already tracked
        if (ownership[_productId].owner == address(0)) {
            ProvenanceContract.Product[] memory products = provenanceContract.getProductsByOwner(msg.sender);
            bool found = false;

            for (uint256 i = 0; i < products.length; i++) {
                if (
                    keccak256(abi.encodePacked(products[i].productId)) ==
                    keccak256(abi.encodePacked(_productId))
                ) {
                    ownership[_productId].owner = msg.sender;
                    found = true;
                    break;
                }
            }

            require(found, "Not current owner (not found in Provenance)");
        } else {
            require(ownership[_productId].owner == msg.sender, "Not current owner");
        }

        listings[_productId] = Listing({
            seller: msg.sender,
            price: _price,
            isListed: true
        });

        listedProductIds.push(_productId);

        emit ProductListed(_productId, msg.sender, _price);
    }

    /**
     * @notice Purchases a listed product
     * @param _productId ID of the product to purchase
     */
    function buyProduct(string memory _productId) external payable {
        Listing memory listing = listings[_productId];
        require(listing.isListed, "Product not listed for sale");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(!ownership[_productId].isStolen, "Product is stolen");

        address seller = listing.seller;

        ownership[_productId].owner = msg.sender;
        listings[_productId].isListed = false;

        payable(seller).transfer(msg.value);

        emit OwnershipTransferred(_productId, seller, msg.sender);
    }

    /**
     * @notice Marks a product as stolen
     * @param _productId ID of the product to mark as stolen
     */
    function markAsStolen(string memory _productId) external {
        require(ownership[_productId].owner == msg.sender, "Not current owner");
        ownership[_productId].isStolen = true;

        emit GoodMarkedStolen(_productId, msg.sender);
    }

    /**
     * @notice Gets the current owner of a product
     * @param _productId Product ID to query
     * @return Address of the current owner
     */
    function getOwner(string memory _productId) external view returns (address) {
        return ownership[_productId].owner;
    }

    /**
     * @notice Checks if a product is marked as stolen
     * @param _productId Product ID to query
     * @return True if the product is stolen
     */
    function isStolen(string memory _productId) external view returns (bool) {
        return ownership[_productId].isStolen;
    }

    /**
     * @notice Gets the listing details of a product
     * @param _productId Product ID to query
     * @return seller Address of the seller
     * @return price Price in wei
     * @return isListed Boolean indicating if the product is currently listed
     */
    function getListing(string memory _productId) external view returns (address seller, uint256 price, bool isListed) {
        Listing memory listing = listings[_productId];
        return (listing.seller, listing.price, listing.isListed);
    }

    /**
     * @notice Returns all listed product IDs
     * @return Array of product IDs currently listed
     */
    function getAllListedProductIds() external view returns (string[] memory) {
        return listedProductIds;
    }
}
