// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract TestERC721 is ERC721Enumerable {
    constructor() ERC721("TestERC721", "TERC721") {}

    function mint(uint256 amount, address to) external {
        uint count = totalSupply();
        for (uint256 i = 1; i <= amount; i++) {
            _mint(to, count + i);
        }
    }

    function batchTransferFrom(uint[] memory tokenIds, address to) external {
        for (uint i = 0; i < tokenIds.length; i++) {
            transferFrom(msg.sender, to, tokenIds[i]);
        }
    }
}
