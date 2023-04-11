// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IProofOfX {
    struct TokenAttribute {
        string minterName;
        address minterAddress;
        uint64 mintedAt;
        string seed;
        uint16 exhibitionIndex;
    }

    struct Exhibition {
        string name;
        uint64 startTime;
        uint64 endTime;
        address rendererAddress;
    }

    function setExhibition(uint16 exhibitionIndex, string memory name, uint64 startTime, uint64 endTime, address rendererAddress) external;

    function setDescription(string memory desc) external;

    function setBaseExternalUrl(string memory url) external;

    function setRoyalty(address royaltyReceiver, uint96 royaltyFeeNumerator) external;

    function mintByOwner(uint16 exhibitionIndex, string memory minterName, address toAddress) external;

    function mint(uint16 exhibitionIndex, string memory minterName, bytes32 hash, bytes memory sig) external;
}
