// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Factory.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice This contract instance should be created by factory contract.
 * Do not deploy this contract single.
 */
contract Cell {
    address public factory;
    address public denom;
    uint256 public tokenId;
    uint256 public price;

    mapping(address => uint256) public nonce;

    event SetPrice(address operator, uint256 oldOne, uint256 newOne);
    event Withdraw(address operator, address denom, uint256 amount);
    event MakeRequest(address operator, string params, uint256 nonce);

    modifier onlyOwner() {
        address owner = getOwner();
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    constructor(
        address factory_,
        address denom_,
        uint256 tokenId_,
        uint256 price_
    ) {
        factory = factory_;
        denom = denom_;
        tokenId = tokenId_;
        price = price_;
    }

    /**
     * @notice Set up the new price.
     * @dev Only the owner of Cell.
     * @param price_ The new number which user need to pay when making request.
     */
    function setPrice(uint256 price_) external onlyOwner {
        uint256 oldOne = price;
        price = price_;
        emit SetPrice(msg.sender, oldOne, price);
    }

    /**
     * @notice Withdraw the tokens in contract.
     * @dev Only the owner of Cell.
     * @param to The account address which will receive the token.
     */
    function withdraw(address to) external onlyOwner {
        uint256 amount;

        if (denom == address(0)) {
            amount = address(this).balance;
        } else {
            amount = IERC20(denom).balanceOf(address(this));
        }
        uint256 withdrawAmount = amount;

        uint256 fee;
        uint256 feeRate = Factory(factory).getFeeRate();
        if (feeRate > 0) {
            fee = (amount * feeRate) / 1e18;
            amount = amount - fee;
        }

        if (denom == address(0)) {
            payable(to).transfer(amount);
            payable(Factory(factory).treasury()).transfer(fee);
        } else {
            IERC20(denom).transfer(msg.sender, amount);
            IERC20(denom).transfer(Factory(factory).treasury(), fee);
        }

        emit Withdraw(msg.sender, denom, withdrawAmount);
    }

    /**
     * @notice User make the request.
     * @param params The params which will be the params when handle the request in the contralize server. The param should be JSON string.
     */
    function makeRequest(string memory params) external payable {
        if (price > 0) {
            if (denom == address(0)) {
                require(price == msg.value, "invalid gas token amount");
            } else {
                IERC20(denom).transferFrom(msg.sender, address(this), price);
            }
        }
        nonce[msg.sender]++;
        emit MakeRequest(msg.sender, params, nonce[msg.sender]);
    }

    /**
     * @notice Return the owner address of this Cell.
     */
    function getOwner() public view returns (address owner) {
        address registry = Factory(factory).registry();
        owner = IERC721(registry).ownerOf(tokenId);
    }
}
