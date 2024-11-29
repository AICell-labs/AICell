
## AgentRegistry

### ERC721.sol (solmate)

### GenericRegistry.sol

```solidity

// Open sourced from: https://stackoverflow.com/questions/67893318/solidity-how-to-represent-bytes32-as-string
/// @dev Converts bytes16 input data to hex16.
/// @notice This method converts bytes into the same bytes-character hex16 representation.
/// @param data bytes16 input data.
/// @return result hex16 conversion from the input bytes16 data.
function _toHex16(bytes16 data) internal pure returns (bytes32 result);

/// @dev Gets the hash of the unit.
/// @param unitId Unit Id.
/// @return Unit hash.
function _getUnitHash(uint256 unitId) internal view virtual returns (bytes32);

/// @dev Returns unit token URI.
/// @notice Expected multicodec: dag-pb; hashing function: sha2-256, with base16 encoding and leading CID_PREFIX removed.
/// @param unitId Unit Id.
/// @return Unit token URI string.
function tokenURI(uint256 unitId) public view virtual override returns (string memory);

```

### AgentRegistry.sol

```solidity

// Map of agent Id => set of updated IPFS hashes
mapping(uint256 => bytes32[]) public mapAgentIdHashes;

/// @dev Creates a agent.
/// @param agentOwner Owner of the agent.
/// @param agentHash IPFS CID hash of the agent metadata.
/// @return agentId The id of a minted agent.
function create(address agentOwner, bytes32 agentHash) external returns (uint256 agentId);

/// @dev Updates the agent hash.
/// @param agentId Agent Id.
/// @param agentHash Updated IPFS CID hash of the agent metadata.
/// @return success True, if function executed successfully.
function updateHash(uint256 agentId, bytes32 agentHash) external returns (bool success);

/// @dev Gets agent hashes.
/// @param agentId Agent Id.
/// @return numHashes Number of hashes.
/// @return agentHashes The list of agent hashes.
function getHashes(uint256 agentId) external view returns (uint256 numHashes, bytes32[] memory agentHashes);
```

### AgentFactory.sol

```solidity

/// @dev Creates agent.
/// @param agentOwner Owner of the agent.
/// @param agentHash IPFS CID hash of the agent metadata.
/// @param price Minimum required payment the agent accepts.
/// @return agentId The id of a created agent.
/// @return mech The created mech instance address.
function create(
    address agentOwner,
    bytes32 agentHash,
    uint256 price
) external returns (uint256 agentId, address mech)

```

### AgentMech.sol

```solidity

// Minimum required price
uint256 public price;
// Number of undelivered requests
uint256 public numUndeliveredRequests;
// Number of total requests
uint256 public numTotalRequests;

// Map of requests counts for corresponding addresses
mapping(address => uint256) public mapRequestsCounts;
// Map of request Ids
mapping(uint256 => uint256[2]) public mapRequestIds;
// Map of request Id => sender address
mapping(uint256 => address) public mapRequestAddresses;
// Map of account nonces
mapping(address => uint256) public mapNonces;

/// @dev Registers a request.
/// @param data Self-descriptive opaque data-blob.
function request(bytes memory data) external payable returns (uint256 requestId, uint256 requestIdWithNonce);

/// @dev Gets the request Id.
/// @param account Account address.
/// @param data Self-descriptive opaque data-blob.
/// @return requestId Corresponding request Id.
function getRequestId(address account, bytes memory data) public pure returns (uint256 requestId);

/// @dev Gets the request Id with a specific nonce.
/// @param account Account address.
/// @param data Self-descriptive opaque data-blob.
/// @param nonce Nonce.
/// @return requestId Corresponding request Id.
function getRequestIdWithNonce(
    address account,
    bytes memory data,
    uint256 nonce
) public view returns (uint256 requestId);

/// @dev Delivers a request.
/// @param requestId Request id.``
/// @param requestIdWithNonce Request id with nonce.
/// @param data Self-descriptive opaque data-blob.
function deliver(uint256 requestId, uint256 requestIdWithNonce, bytes memory data) external onlyOperator;

/// @dev Sets the new price.
/// @param newPrice New mimimum required price.
function setPrice(uint256 newPrice) external onlyOperator;

/// @dev Gets the request Id.
/// @param account Account address.
/// @param data Self-descriptive opaque data-blob.
/// @return requestId Corresponding request Id.
function getRequestId(address account, bytes memory data) public pure returns (uint256 requestId);

/// @dev Gets the requests count for a specific account.
/// @param account Account address.
/// @return requestsCount Requests count.
function getRequestsCount(address account) external view returns (uint256 requestsCount);

/// @dev Gets the request Id status.
/// @param requestId Request Id.
/// @return status Request status.
function getRequestStatus(uint256 requestId) external view returns (RequestStatus status);

/// @dev Gets the set of undelivered request Ids with Nonce.
/// @param size Maximum batch size of a returned requests Id set. If the size is zero, the whole set is returned.
/// @param offset The number of skipped requests that are not going to be part of the returned requests Id set.
/// @return requestIds Set of undelivered request Ids.
function getUndeliveredRequestIds(uint256 size, uint256 offset) external view returns (uint256[] memory requestIds);
```