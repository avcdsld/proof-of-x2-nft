// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IProofOfX} from "./interfaces/IProofOfX.sol";
import {IRenderer} from "./interfaces/IRenderer.sol";
import {Util} from "./Util.sol";

contract ProofOfX is IProofOfX, ERC721, ERC2981, Ownable, Util {
    uint256 public totalSupply;
    string public description;
    string public baseExternalUrl;

    uint16 public totalExhibitions;
    mapping(uint16 => IProofOfX.Exhibition) public exhibitions;
    mapping(uint256 => IProofOfX.TokenAttribute) public tokenAttributes;
    mapping(bytes32 => bool) public mintedHash;

    constructor() ERC721("ProofOfX", "POX") {}

    function setExhibition(uint16 exhibitionIndex, string memory name, uint64 startTime, uint64 endTime, address rendererAddress) external onlyOwner {
        exhibitions[exhibitionIndex] = IProofOfX.Exhibition(name, startTime, endTime, rendererAddress);
    }

    function setDescription(string memory desc) external onlyOwner {
        description = desc;
    }

    function setBaseExternalUrl(string memory url) external onlyOwner {
        baseExternalUrl = url;
    }

    function setRoyalty(address royaltyReceiver, uint96 royaltyFeeNumerator) external onlyOwner {
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    function mintByOwner(uint16 exhibitionIndex, string memory name, address toAddress) external onlyOwner {
        uint256 tokenId = ++totalSupply;
        address minterAddress = _msgSender();
        uint64 mintedAt = uint64(block.timestamp);
        bytes32 seed = keccak256(abi.encodePacked(blockhash(block.number - 1), toAddress));
        tokenAttributes[tokenId] = IProofOfX.TokenAttribute(name, minterAddress, mintedAt, bytes32ToString(seed), exhibitionIndex);
        _mint(toAddress, tokenId);
    }

    function mint(uint16 exhibitionIndex, string memory name, bytes32 hash, bytes memory sig) external {
        require(keccak256(abi.encodePacked(_msgSender(), exhibitionIndex, address(this))) == hash, "invalid hash");
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(hash), sig) == owner(), "invalid sig");
        require(mintedHash[hash] == false, "minted hash");
        mintedHash[hash] = true;

        uint256 tokenId = ++totalSupply;
        address minterAddress = _msgSender();
        uint64 mintedAt = uint64(block.timestamp);
        bytes32 seed = keccak256(abi.encodePacked(blockhash(block.number - 1), minterAddress));
        tokenAttributes[tokenId] = IProofOfX.TokenAttribute(name, minterAddress, mintedAt, bytes32ToString(seed), exhibitionIndex);
        _mint(_msgSender(), tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "not exists");
        return string.concat("data:application/json;utf8,", getMetadata(tokenId));
    }

    function getMetadata(uint256 tokenId) private view returns (string memory) {
        IProofOfX.TokenAttribute memory tokenAttribute = tokenAttributes[tokenId];
        IProofOfX.Exhibition memory exhibition = exhibitions[tokenAttribute.exhibitionIndex];
        IRenderer renderer = IRenderer(exhibition.rendererAddress);
        return
            string.concat(
                '{"name":"Proof of X: Exhibition Attendee #',
                Strings.toString(tokenId),
                '","description":"',
                description,
                '","image":"',
                renderer.imageUrl(tokenId),
                '","animation_url":"',
                renderer.animationUrl(tokenId, tokenAttribute),
                '","external_url":"',
                baseExternalUrl,
                Strings.toString(tokenId),
                '","attributes":[{"trait_type":"Exhibition Name","value":"',
                exhibition.name,
                '"},{"display_type":"date","trait_type":"Exhibition Start Time","value":"',
                Strings.toString(uint256(exhibition.startTime)),
                '"},{"display_type":"date","trait_type":"Exhibition End Time","value":"',
                Strings.toString(uint256(exhibition.endTime)),
                '"},{"trait_type":"Name","value":"',
                tokenAttribute.name,
                '"},{"trait_type":"Minter Address","value":"',
                Strings.toHexString(tokenAttribute.minterAddress),
                '"},{"display_type":"date","trait_type":"Minted At","value":"',
                Strings.toString(uint256(tokenAttribute.mintedAt)),
                '"},{"trait_type":"Seed","value":"',
                "0x", tokenAttribute.seed,
                '"}]}'
            );
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }

    function getTokenAttributes(uint256[] memory tokenIds) public view returns (IProofOfX.TokenAttribute[] memory) {
        IProofOfX.TokenAttribute[] memory result = new IProofOfX.TokenAttribute[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            IProofOfX.TokenAttribute memory tokenAttribute = tokenAttributes[tokenIds[i]];
            result[i] = tokenAttribute;
        }
        return result;
    }
}
