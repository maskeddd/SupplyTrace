// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEntityContract {
    function isVerified(address user) external view returns (bool);
}

interface IProvenance {
    function transferOwnership(uint256 productId, address newOwner) external;
}

contract Marketplace {
    IEntityContract public entityContract;
    IProvenance public provenanceContract;
    address public admin;

    constructor(address _entityContract, address _provenanceContract) {
        entityContract = IEntityContract(_entityContract);
        provenanceContract = IProvenance(_provenanceContract);
        admin = msg.sender;
    }

    struct Sale {
        address buyer;
        uint256 timestamp;
    }

    struct Listing {
        uint256 productId;
        string title;
        string description;
        address seller;
        bool sold;
        Sale[] history;
    }

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event ItemListed(uint256 indexed listingId, uint256 productId, address indexed seller);
    event ItemSold(uint256 indexed listingId, address indexed buyer, uint256 timestamp);

    modifier onlyVerifiedManufacturer() {
        require(entityContract.isVerified(msg.sender), "Not a verified manufacturer");
        _;
    }

    modifier onlySeller(uint256 listingId) {
        require(msg.sender == listings[listingId].seller, "Only seller can perform this action");
        _;
    }

    function listItem(uint256 productId, string memory title, string memory description) external onlyVerifiedManufacturer {
        listings[nextListingId] = Listing({
            productId: productId,
            title: title,
            description: description,
            seller: msg.sender,
            sold: false,
            history: new Sale[](0)
        });

        emit ItemListed(nextListingId, productId, msg.sender);
        nextListingId++;
    }

    function buyItem(uint256 listingId) external {
        Listing storage item = listings[listingId];
        require(!item.sold, "Item already sold");
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        provenanceContract.transferOwnership(item.productId, msg.sender);

        item.history.push(Sale({
            buyer: msg.sender,
            timestamp: block.timestamp
        }));

        item.sold = true;

        emit ItemSold(listingId, msg.sender, block.timestamp);
    }

    function getSaleHistory(uint256 listingId) external view returns (Sale[] memory) {
        return listings[listingId].history;
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
}
