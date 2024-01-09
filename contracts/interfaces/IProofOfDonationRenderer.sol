// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IProofOfDonationRenderer {
    function uri(uint256 tokenId) external view returns (string memory);
}
