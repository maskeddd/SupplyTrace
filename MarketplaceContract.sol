// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ProvenanceContract.sol";

/**
 * @title MarketplaceContract
 * @dev Manages ownership of manufactured goods after they leave the manufacturer
 * @notice Handles ownership transfers, listings, purchases, and stolen goods reporting
 */
contract MarketplaceContract {
    /// @dev Reference to ProvenanceContract for good verification (future use)
    ProvenanceContract public provenanceContract;

    /**
     * @dev Represents a product listing in the marketplace
     * @param seller Address of the person listing the product
     * @param price Price in wei
     * @param isListed Whether the product is currently listed for sale
     */
    struct Listing {
        address seller;
        uint256 price;
        bool isListed;
    }

    /**
     * @dev Represents the ownership status of a product
     * @param owner Current owner's Ethereum address
     * @param isStolen Whether the good has been reported as stolen
     */
    struct Ownership {
        address owner;
        bool isStolen;
    }

    /// @dev Maps product IDs to their marketplace listings
    mapping(string => Listing) public listings;

    /// @dev Maps product IDs to their ownership status
    mapping(string => Ownership) public ownership;

    /// @dev Emitted when a product is listed for sale
    event ProductListed(string indexed productId, address indexed seller, uint256 price);

    /// @dev Emitted when ownership of a product is transferred
    event OwnershipTransferred(string indexed productId, address indexed from, address indexed to);

    /// @dev Emitted when a product is marked as stolen
    event GoodMarkedStolen(string indexed productId, address indexed reporter);

    /**
     * @dev Constructor sets the ProvenanceContract address for verification
     * @param _provenanceContract Address of the deployed ProvenanceContract
     */
    constructor(address _provenanceContract) {
        provenanceContract = ProvenanceContract(_provenanceContract);
    }

    /**
     * @dev Allows the current owner to list a product for sale
     * @param _productId ID of the product to list
     * @param _price Sale price in wei
     * @notice Only the current owner can list the product
     */
    function listProduct(string memory _productId, uint256 _price) external {
        require(_price > 0, "Price must be greater than 0");
        require(ownership[_productId].owner == msg.sender, "Not current owner");

        listings[_productId] = Listing({
            seller: msg.sender,
            price: _price,
            isListed: true
        });

        emit ProductListed(_productId, msg.sender, _price);
    }

    /**
     * @dev Allows a buyer to purchase a listed product
     * @param _productId ID of the product to purchase
     * @notice Transfers Ether to seller and ownership to buyer
     */
    function buyProduct(string memory _productId) external payable {
        Listing memory listing = listings[_productId];
        require(listing.isListed, "Product not listed for sale");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(!ownership[_productId].isStolen, "Product is stolen");

        address seller = listing.seller;

        // Transfer ownership
        ownership[_productId].owner = msg.sender;
        listings[_productId].isListed = false;

        // Pay the seller
        payable(seller).transfer(msg.value);

        emit OwnershipTransferred(_productId, seller, msg.sender);
    }

    /**
     * @dev Initial ownership transfer from manufacturer to first consumer
     * @param _productId ID of the product to transfer
     * @param _to the Ethereum address of the first consumer/buyer
     * @notice Good must not already have an owner assigned
     */
    function initialOwnershipTransfer(string memory _productId, address _to) external {
        require(ownership[_productId].owner == address(0), "Already has owner");
        ownership[_productId].owner = _to;
        emit OwnershipTransferred(_productId, address(0), _to);
    }

    /**
     * @dev Allows the current owner to mark their product as stolen
     * @param _productId ID of the product to mark as stolen
     * @notice Prevents the good from being sold
     */
    function markAsStolen(string memory _productId) external {
        require(ownership[_productId].owner == msg.sender, "Not current owner");
        ownership[_productId].isStolen = true;
        emit GoodMarkedStolen(_productId, msg.sender);
    }

    /**
     * @dev Returns the current owner of a product
     * @param _productId ID of the product to query
     * @return address Current owner's Ethereum address
     */
    function getOwner(string memory _productId) external view returns (address) {
        return ownership[_productId].owner;
    }

    /**
     * @dev Checks if a product is marked as stolen
     * @param _productId ID of the product to check
     * @return bool True if the product is marked as stolen
     */
    function isStolen(string memory _productId) external view returns (bool) {
        return ownership[_productId].isStolen;
    }

    /**
     * @dev Returns listing information for a product
     * @param _productId ID of the product to check
     * @return seller Address of the seller
     * @return price Price of the product in wei
     * @return isListed Whether the product is listed for sale
     */
    function getListing(string memory _productId) external view returns (address, uint256, bool) {
        Listing memory listing = listings[_productId];
        return (listing.seller, listing.price, listing.isListed);
    }
}
