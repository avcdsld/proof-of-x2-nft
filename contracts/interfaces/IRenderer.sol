// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IProofOfX} from "./IProofOfX.sol";

interface IRenderer {
    function imageUrl(uint256 tokenId) external view returns (string memory);
    function animationUrl(uint256 tokenId, IProofOfX.TokenAttribute memory tokenAttribute) external view returns (string memory);
}
