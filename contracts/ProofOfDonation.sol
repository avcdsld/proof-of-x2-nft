// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IProofOfDonation} from "./interfaces/IProofOfDonation.sol";
import {IProofOfDonationRenderer} from "./interfaces/IProofOfDonationRenderer.sol";

contract ProofOfDonation is IProofOfDonation, ERC1155, ERC1155Burnable, ERC1155Supply, Ownable {
    mapping(uint256 => bool) public activeTokens;
    mapping(uint256 => uint256) public prices;
    IProofOfDonationRenderer public renderer;

    constructor() ERC1155("") Ownable(_msgSender()) {}

    function setRenderer(address rendererAddress) external onlyOwner {
        renderer = IProofOfDonationRenderer(rendererAddress);
    }

    function activateToken(uint256 tokenId, uint256 price) external onlyOwner {
        activeTokens[tokenId] = true;
        prices[tokenId] = price;
    }

    function deactivateToken(uint256 tokenId) external onlyOwner {
        activeTokens[tokenId] = false;
    }

    function withdrawETH(address payable recipient) external onlyOwner {
        Address.sendValue(recipient, address(this).balance);
    }

    function withdrawERC20(address tokenAddress, address recipient, uint256 amount) external onlyOwner {
        require(IERC20(tokenAddress).transfer(recipient, amount), "transfer failed");
    }

    function donate(uint256 tokenId, uint256 quantity) external payable {
        require(activeTokens[tokenId], "not active");
        require(msg.value == prices[tokenId] * quantity, "invalid value");
        _mint(_msgSender(), tokenId, quantity, "");
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return renderer.uri(tokenId);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
