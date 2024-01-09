// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IProofOfDonationRenderer} from "./interfaces/IProofOfDonationRenderer.sol";

contract ProofOfDonationRenderer is IProofOfDonationRenderer, Ownable {
    struct Metadata {
        string name;
        string description;
        string image;
        string artworkCreator;
    }

    mapping(uint256 => Metadata) public metadata;

    constructor() Ownable(_msgSender()) {}

    function setMetadata(
        uint16 tokenId,
        string memory name,
        string memory description,
        string memory image,
        string memory artworkCreator
    ) external onlyOwner {
        metadata[tokenId] = Metadata(
            name,
            description,
            image,
            artworkCreator
        );
    }

    function uri(uint256 tokenId) external view returns (string memory) {
        return
            string.concat(
                '{"name":"',
                metadata[tokenId].name,
                '","description":"',
                metadata[tokenId].description,
                '","image":"',
                metadata[tokenId].image,
                '","attributes":[{"trait_type":"Artwork Creator","value":"',
                metadata[tokenId].artworkCreator,
                '"}]}'
            );
    }
}
