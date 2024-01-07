// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IProofOfDonation} from "./interfaces/IProofOfDonation.sol";
import {IProofOfDonationRenderer} from "./interfaces/IProofOfDonationRenderer.sol";
import {Util} from "./Util.sol";

contract ProofOfDonation is IProofOfDonation, ERC721, ERC2981, Ownable, Util {
    uint256 public totalSupply;
    mapping(uint16 => IProofOfDonation.Donation) public donations;
    mapping(uint256 => IProofOfDonation.TokenAttribute) public tokenAttributes;

    constructor() ERC721("Proof of Donation", "POD") Ownable(_msgSender()) {}

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
    ) external onlyOwner {
        IProofOfDonation.Donation memory existingDonation = donations[donationIndex];
        uint256 totalAmount = existingDonation.totalAmount;
        uint64 totalDonors = existingDonation.totalDonors;
        donations[donationIndex] = IProofOfDonation.Donation(
            name,
            description,
            baseExternalUrl,
            imageUrl,
            animationUrl,
            artworkCreator,
            rendererAddress,
            totalAmount,
            minimumAmount,
            totalDonors,
            createdAt,
            active
        );
    }

    function setRoyalty(address royaltyReceiver, uint96 royaltyFeeNumerator) external onlyOwner {
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    function withdrawETH(address payable recipient) external onlyOwner {
        Address.sendValue(recipient, address(this).balance);
    }

    function withdrawERC20(address tokenAddress, address recipient, uint256 amount) external onlyOwner {
        require(IERC20(tokenAddress).transfer(recipient, amount), "transfer failed");
    }

    function mintByOwner(uint16 donationIndex, string memory name, address toAddress) external onlyOwner {
        uint256 tokenId = ++totalSupply + (donationIndex * 1000000);
        address donorAddress = _msgSender();
        uint64 donatedAt = uint64(block.timestamp);
        tokenAttributes[tokenId] = IProofOfDonation.TokenAttribute(name, donorAddress, donatedAt, donationIndex);
        _mint(toAddress, tokenId);
    }

    function donate(uint16 donationIndex, string memory name, address toAddress) external payable {
        IProofOfDonation.Donation memory donation = donations[donationIndex];
        require(donation.active, "not active");
        require(msg.value >= donation.minimumAmount, "invalid value");

        uint256 tokenId = ++totalSupply + (donationIndex * 1000000);
        address donorAddress = _msgSender();
        uint64 donatedAt = uint64(block.timestamp);
        tokenAttributes[tokenId] = IProofOfDonation.TokenAttribute(name, donorAddress, donatedAt, donationIndex);
        _mint(toAddress, tokenId);

        donation.totalAmount += msg.value;
        donation.totalDonors++;
        emit Donate(donationIndex, donorAddress, msg.value);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat("data:application/json;utf8,", getMetadata(tokenId));
    }

    function getMetadata(uint256 tokenId) private view returns (string memory) {
        IProofOfDonation.TokenAttribute memory tokenAttribute = tokenAttributes[tokenId];
        IProofOfDonation.Donation memory donation = donations[tokenAttribute.donationIndex];
        string memory imageUrl = donation.imageUrl;
        string memory animationUrl = donation.animationUrl;
        if (donation.rendererAddress != address(0)) {
            IProofOfDonationRenderer renderer = IProofOfDonationRenderer(donation.rendererAddress);
            imageUrl = renderer.imageUrl(tokenId);
            animationUrl = renderer.animationUrl(tokenId, tokenAttribute);
        }
        return
            string.concat(
                '{"name":"Proof of Donation #',
                Strings.toString(tokenId),
                '","description":"',
                donation.description,
                '","image":"',
                imageUrl,
                '","animation_url":"',
                animationUrl,
                '","external_url":"',
                donation.baseExternalUrl,
                Strings.toString(tokenId),
                '","attributes":[{"trait_type":"Donation Name","value":"',
                donation.name,
                '"},{"display_type":"date","trait_type":"Donation Created Time","value":"',
                Strings.toString(uint256(donation.createdAt)),
                '"},{"trait_type":"Artwork Creator","value":"',
                donation.artworkCreator,
                '"},{"trait_type":"Donor Name","value":"',
                escapeString(tokenAttribute.name),
                '"},{"trait_type":"Donor Address","value":"',
                Strings.toHexString(tokenAttribute.donorAddress),
                '"},{"display_type":"date","trait_type":"Donated At","value":"',
                Strings.toString(uint256(tokenAttribute.donatedAt)),
                '"}]}'
            );
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }

    function getTokenAttributes(uint256[] memory tokenIds) public view returns (IProofOfDonation.TokenAttribute[] memory) {
        IProofOfDonation.TokenAttribute[] memory result = new IProofOfDonation.TokenAttribute[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = tokenAttributes[tokenIds[i]];
        }
        return result;
    }
}
