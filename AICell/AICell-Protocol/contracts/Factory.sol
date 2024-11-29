// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Registry.sol";
import "./Cell.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {
    address public registry;
    address public treasury;
    uint256 private _feeRate; // Scaled 10**18

    mapping(uint256 => address) public tokenId2Cell;

    event SetFeeRate(address operator, uint256 oldOne, uint256 newOne);
    event CreateCell(address owner, address cell, uint256 tokenId);

    /**
     * @notice Constuctor
     * @dev The feeRate must be [0, 10**18].
     * @param registry_ The address of Registry contract
     * @param treasury_ The treasury address which will receive the fee.
     * @param feeRate The fee rate which is scaled by 10**18.
     */
    constructor(address registry_, address treasury_, uint256 feeRate) {
        registry = registry_;
        treasury = treasury_;
        _feeRate = feeRate;
    }

    /**
     * @notice Set up the feeRate.
     * @dev Only owner of this contract.
     * @param feeRate_ The new fee rate.
     */
    function setFeeRate(uint256 feeRate_) external onlyOwner {
        require (feeRate_ < 1e18);
        uint256 oldFeeRate = _feeRate;
        _feeRate = feeRate_;
        emit SetFeeRate(msg.sender, oldFeeRate, _feeRate);
    }

    /**
     * @notice Return the current feeRate.
     */
    function getFeeRate() external view returns (uint256) {
        return _feeRate;
    }

    /**
     * @notice Create the Cell.
     * @param to The receiver address which will be the owner of Cell.
     * @param tokenURI The metadata link of Cell.
     * @param encryptURL The encoded request path.
     * @param denom The token address which the caller will pay.
     * @param price The token number of each call.
     * @return tokenId The Cell NFT tokenId.
     * @return cell The Cell contract address.
     */
    function create(
        address to,
        string memory tokenURI,
        string memory encryptURL,
        address denom,
        uint256 price
    ) public returns (uint256 tokenId, address cell) {
        tokenId = Registry(registry).create(to, tokenURI, encryptURL);
        bytes32 salt = keccak256(abi.encode(to, encryptURL, tokenId));
        cell = _createCell(salt, denom, tokenId, price);
        tokenId2Cell[tokenId] = cell;
        emit CreateCell(to, cell, tokenId);
    }

    function _createCell(
        bytes32 salt,
        address denom,
        uint256 tokenId,
        uint256 price
    ) internal virtual returns (address cell) {
        cell = address(
            (new Cell){salt: salt}(address(this), denom, tokenId, price)
        );
    }
}
