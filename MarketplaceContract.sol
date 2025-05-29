// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./ProvenanceContract.sol";

/**
 * @title MarketplaceContract
 * @dev Manages ownership of manufactured goods after they leave the manufacturer
 * @notice Handles ownership transfers between consumers and stolen good reporting
 */
contract MarketplaceContract {
    /// @dev Reference to ProvenanceContract for good verification
    ProvenanceContract public provenanceContract;
    
    /**
     * @dev Represents ownership status of a good
     * @param owner Current owner's Ethereum address (address(0) means no owner assigned)
     * @param isStolen Whether the good has been reported as stolen
     */
    struct Ownership {
        address owner;
        bool isStolen;
    }
    
    /// @dev Maps good IDs to their ownership status
    mapping(uint256 => Ownership) public ownership;
    
    /// @dev Emitted when ownership of a good is transferred
    event OwnershipTransferred(uint256 indexed goodId, address indexed from, address indexed to);
    
    /// @dev Emitted when a good is marked as stolen
    event GoodMarkedStolen(uint256 indexed goodId, address indexed reporter);
    
    /**
     * @dev Constructor sets the ProvenanceContract address for verification
     * @param _provenanceContract Address of the deployed ProvenanceContract
     */
    constructor(address _provenanceContract) {
        provenanceContract = ProvenanceContract(_provenanceContract);
    }
    
    /**
     * @dev Transfers ownership of a good between consumers
     * @param _goodId ID of the good to transfer
     * @param _to Ethereum address of the new owner
     * @notice Only current owner can transfer ownership
     * @notice Cannot transfer stolen goods
     * @notice Used for consumer-to-consumer transactions
     */
    function transferOwnership(uint256 _goodId, address _to) external {
        require(provenanceContract.goodExists(_goodId), "Good does not exist");
        require(ownership[_goodId].owner == msg.sender, "Not current owner");
        require(!ownership[_goodId].isStolen, "Good is marked as stolen");
        require(_to != address(0), "Invalid recipient");
        
        address previousOwner = ownership[_goodId].owner;
        ownership[_goodId].owner = _to;
        
        emit OwnershipTransferred(_goodId, previousOwner, _to);
    }
    
    /**
    * @dev Initial ownership transfer from manufacturer to first consumer
    * @param _goodId ID of the good to transfer
    * @param _to Ethereum address of the first consumer/buyer
    * @notice Only the original manufacturer can perform initial ownership transfer
    * @notice Good must not already have an owner assigned
    * @notice Represents the sale from manufacturer/retailer to first consumer
    */
    function initialOwnershipTransfer(uint256 _goodId, address _to) external {
        require(provenanceContract.goodExists(_goodId), "Good does not exist");
        require(ownership[_goodId].owner == address(0), "Good already has owner");
        
        // Verify caller is the manufacturer of the good
        (address manufacturer, , , , , ) = provenanceContract.goods(_goodId);
        require(manufacturer == msg.sender, "Not good manufacturer");
        
        ownership[_goodId].owner = _to;
        
        emit OwnershipTransferred(_goodId, address(0), _to);
    }
    
    /**
     * @dev Allows current owner to mark their good as stolen
     * @param _goodId ID of the good to mark as stolen
     * @notice Only current owner can mark good as stolen
     * @notice Once marked as stolen, the good cannot be transferred
     * @notice Provides a mechanism for reporting theft and preventing resale
     */
    function markAsStolen(uint256 _goodId) external {
        require(provenanceContract.goodExists(_goodId), "Good does not exist");
        require(ownership[_goodId].owner == msg.sender, "Not current owner");
        
        ownership[_goodId].isStolen = true;
        
        emit GoodMarkedStolen(_goodId, msg.sender);
    }
    
    /**
     * @dev Returns the current owner of a good
     * @param _goodId ID of the good to query
     * @return address Current owner's Ethereum address (address(0) if no owner)
     */
    function getOwner(uint256 _goodId) external view returns (address) {
        return ownership[_goodId].owner;
    }
    
    /**
     * @dev Checks if a good has been marked as stolen
     * @param _goodId ID of the good to check
     * @return bool True if the good is marked as stolen, false otherwise
     */
    function isStolen(uint256 _goodId) external view returns (bool) {
        return ownership[_goodId].isStolen;
    }
}
