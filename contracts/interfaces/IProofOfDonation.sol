// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IProofOfDonation {
    event Donate(uint16 donationIndex, address indexed donorAddress, uint256 indexed amount);

    struct TokenAttribute {
        string name;
        address donorAddress;
        uint64 donatedAt;
        uint16 donationIndex;
    }

    struct Donation {
        string name;
        string description;
        string baseExternalUrl;
        string imageUrl; // Required if rendererAddress is not set.
        string animationUrl; // Required if rendererAddress is not set.
        string artworkCreator;
        address rendererAddress; // Required if imageUrl/animationUrl are not set.
        uint256 totalAmount;
        uint64 minimumAmount;
        uint64 totalDonors;
        uint64 createdAt;
        bool active;
    }

    function setDonation(
        uint16 donationIndex,
        string memory name,
        string memory description,
        string memory baseExternalUrl,
        string memory imageUrl,
        string memory animationUrl,
        string memory artworkCreator,
        address rendererAddress,
        uint64 minimumAmount,
        uint64 createdAt,
        bool active
    ) external;

    function setRoyalty(address royaltyReceiver, uint96 royaltyFeeNumerator) external;

    function withdrawETH(address payable recipient) external;

    function withdrawERC20(address tokenAddress, address recipient, uint256 amount) external;

    function mintByOwner(uint16 donationIndex, string memory name, address toAddress) external;

    function donate(uint16 donationIndex, string memory name, address toAddress) external payable;

    function getTokenAttributes(uint256[] memory tokenIds) external view returns (IProofOfDonation.TokenAttribute[] memory);
}
