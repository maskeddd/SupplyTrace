// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ProvenanceContract.sol";

contract MarketplaceContract {
    ProvenanceContract public provenanceContract;

    struct Listing {
        address seller;
        uint256 price; // in wei
        bool isListed;
    }

    struct Ownership {
        address owner;
        bool isStolen;
    }

    mapping(string => Listing) public listings;
    mapping(string => Ownership) public ownership;

    string[] public listedProductIds; // Dynamic product list

    event ProductListed(string indexed productId, address indexed seller, uint256 price);
    event OwnershipTransferred(string indexed productId, address indexed from, address indexed to);
    event GoodMarkedStolen(string indexed productId, address indexed reporter);

    constructor(address _provenanceContract) {
        provenanceContract = ProvenanceContract(_provenanceContract);
    }

    function listProduct(string memory _productId, uint256 _price) external {
        require(_price > 0, "Price must be greater than 0");

        // Auto-infer ownership from ProvenanceContract if not yet set
        if (ownership[_productId].owner == address(0)) {
            ProvenanceContract.Product[] memory products = provenanceContract.getProductsByOwner(msg.sender);
            bool found = false;

            for (uint256 i = 0; i < products.length; i++) {
                if (keccak256(abi.encodePacked(products[i].productId)) == keccak256(abi.encodePacked(_productId))) {
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

        listedProductIds.push(_productId); // Add to listing array

        emit ProductListed(_productId, msg.sender, _price);
    }

    function buyProduct(string memory _productId) external payable {
        Listing memory listing = listings[_productId];
        require(listing.isListed, "Product not listed for sale");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(!ownership[_productId].isStolen, "Product is stolen");

        address seller = listing.seller;

        // Transfer ownership
        ownership[_productId].owner = msg.sender;
        listings[_productId].isListed = false;

        payable(seller).transfer(msg.value);

        emit OwnershipTransferred(_productId, seller, msg.sender);
    }

    function markAsStolen(string memory _productId) external {
        require(ownership[_productId].owner == msg.sender, "Not current owner");
        ownership[_productId].isStolen = true;
        emit GoodMarkedStolen(_productId, msg.sender);
    }

    function getOwner(string memory _productId) external view returns (address) {
        return ownership[_productId].owner;
    }

    function isStolen(string memory _productId) external view returns (bool) {
        return ownership[_productId].isStolen;
    }

    function getListing(string memory _productId) external view returns (address, uint256, bool) {
        Listing memory listing = listings[_productId];
        return (listing.seller, listing.price, listing.isListed);
    }

    // Get all listed product IDs
    function getAllListedProductIds() external view returns (string[] memory) {
        return listedProductIds;
    }
}
