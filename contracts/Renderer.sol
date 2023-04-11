// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import {IRenderer} from "./interfaces/IRenderer.sol";
import {IProofOfX} from "./interfaces/IProofOfX.sol";

contract Renderer is IRenderer, Ownable {
    string public baseImageUrl;
    string public animationUrlAsHttp;

    constructor() {
        // TODO: remove
        baseImageUrl = "https://bafybeict7ckaknrmk24erku33ip5brq3nw7r2rj35pjhbbfcy4kxhfcfvq.ipfs.nftstorage.link/#";
        animationUrlAsHttp = "https://kitasenjudesign.com/proofofx/01/";
    }

    function setBaseImageUrl(string memory url) external onlyOwner {
        baseImageUrl = url;
    }

    function setAnimationUrlAsHttp(string memory url) external onlyOwner {
        animationUrlAsHttp = url;
    }

    function imageUrl(uint256 tokenId) external view returns (string memory) {
        return string.concat(baseImageUrl, Strings.toString(tokenId));
    }

    function animationUrl(uint256 /* tokenId */, IProofOfX.TokenAttribute memory tokenAttribute) external view returns (string memory) {
        if (bytes(animationUrlAsHttp).length > 0) {
            return animationUrlAsHttp;
        }
        string memory imageData = string.concat(
            "<html>",
            "<head>",
            '<meta name="viewport" width="device-width," initial-scale="1.0," maximum-scale="1.0," user-scalable="0" />',
            "<style>body { padding: 0; margin: 0; }</style>",
            // externalScript,
            "\n<script>\n",
            "var attribute = {\n",
            '  hash: "0x', tokenAttribute.seed, '",\n',
            '  name: "', tokenAttribute.minterName, '",\n', // TODO: escape
            '  mintedAt: ', Strings.toString(uint256(tokenAttribute.mintedAt)), "\n",
            "}\n",
            "</script>\n",
            "</head>",
            "<body>",
            '<script src="https://ipfs.io/ipfs/QmekTQiZXha9KoPimKgwbgkK5Rj2qRJp7ubqJ2w5fgnn5G"></script>',
            "</body>",
            "</html>"
        );
        return string.concat("data:text/html;charset=UTF-8;base64,", Base64.encode(bytes(imageData)));
    }
}
