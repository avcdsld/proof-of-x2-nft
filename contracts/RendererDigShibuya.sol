// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {IRenderer} from "./interfaces/IRenderer.sol";
import {IProofOfVisit} from "./interfaces/IProofOfVisit.sol";

contract RendererDigShibuya is IRenderer, Ownable {
    IProofOfVisit public proofOfVisit;
    string public imageBaseUrl;
    string public imageUrlSuffix;

    constructor(string memory _imageBaseUrl, string memory _imageUrlSuffix, IProofOfVisit _proofOfVisit) Ownable(_msgSender()) {
        imageBaseUrl = _imageBaseUrl;
        imageUrlSuffix = _imageUrlSuffix;
        proofOfVisit = _proofOfVisit;
    }

    function setImageUrl(string memory url, string memory suffix) external onlyOwner {
        imageBaseUrl = url;
        imageUrlSuffix = suffix;
    }

    function imageUrl(uint256 tokenId) external view returns (string memory) {
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = tokenId;
        IProofOfVisit.TokenAttribute memory tokenAttribute = proofOfVisit.getTokenAttributes(tokenIds)[0];
        uint256 imageIndex = getImageIndex(tokenAttribute);
        return string.concat(imageBaseUrl, Strings.toString(imageIndex), imageUrlSuffix);
    }

    function animationUrl(uint256 /* tokenId */, IProofOfVisit.TokenAttribute memory tokenAttribute) external view returns (string memory) {
        uint256 imageIndex = getImageIndex(tokenAttribute);
        return string.concat(imageBaseUrl, Strings.toString(imageIndex), imageUrlSuffix);
    }

    function getImageIndex(IProofOfVisit.TokenAttribute memory tokenAttribute) public pure returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked(tokenAttribute.name, tokenAttribute.seed));
        return (uint256(hash) % 13) + 1;
    }
}
