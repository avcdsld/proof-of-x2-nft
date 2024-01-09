// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IProofOfDonation {
    function activateToken(uint256 tokenId, uint256 price) external;

    function deactivateToken(uint256 tokenId) external;

    function setRenderer(address rendererAddress) external;

    function withdrawETH(address payable recipient) external;

    function withdrawERC20(address tokenAddress, address recipient, uint256 amount) external;

    function donate(uint256 tokenId, uint256 quantity, bytes32 remembrance) external payable;
}
