// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IProofOfDonation} from "./IProofOfDonation.sol";

interface IProofOfDonationRenderer {
    function imageUrl(uint256 tokenId) external view returns (string memory);
    function animationUrl(uint256 tokenId, IProofOfDonation.TokenAttribute memory tokenAttribute) external view returns (string memory);
}
