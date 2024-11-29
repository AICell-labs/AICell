// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Registry is Ownable, ERC721Enumerable {
    using Strings for uint256;

    uint256 public currentTokenId;
    // tokenId to encrypted request URL
    mapping(uint256 => string) public encryptURLs;

    string private _base_uri;
    // tokenId to token meatadata
    mapping(uint256 => string) private _tokenURIs;
    mapping(string => bool) private  _encryptURLExists;

    event SetBaseURI(address operator, string oldOne, string newOne);

    /**
     * @notice Constructor
     * @param name The name of NFT.
     * @param symbol The symbol of NFT.
     * @param baseURI_ The baseURI of tokenURI, it is optional.
    */
    constructor(string memory name, string memory symbol, string memory baseURI_) ERC721(name, symbol) {
        _base_uri = baseURI_;
        currentTokenId += 1;
    }

    /**
     * @notice Set up the baseURI.
     * @dev Only can be call by the contract owner which is the manager.
     * @param baseURI_ string The new baseURI_.
    */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        string memory oldOne = _base_uri;
        _base_uri = baseURI_;
        emit SetBaseURI(msg.sender, oldOne, _base_uri);
    }

    /**
     * @notice Create the Cell.
     * @param to The owner address of the new Cell.
     * @param tokenURI_ Cell NFT metadata link.
     * @param encryptURL Encoded request path.
     * @return tokenId The tokenId of Cell.
    */
    function create(address to, string memory tokenURI_, string memory encryptURL) external returns(uint tokenId) {
        require(to != address(0), "To can not be zero address");
        require(!_encryptURLExists[encryptURL], "EncryptURL already exist");
        tokenId = currentTokenId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        encryptURLs[tokenId] = encryptURL;
        _encryptURLExists[encryptURL] = true;
        currentTokenId += 1;
    }
    
    /**
     * @notice Return the tokenURI of Cell.
     * @param tokenId The index of NFT.
     * @return string The tokenURI of NFT.
    */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Invalid tokenId");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns(string memory){
        return _base_uri;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
}