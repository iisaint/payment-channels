pragma solidity ^0.4.24;

contract Channel {
  uint public timeout;
  address public sender;
  address public recipient;

  function openChannel(address _recipient, uint _timeout) public payable {
    sender = msg.sender;
    timeout = now + _timeout;
    recipient = _recipient;
  }

  function closeChannel(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint value) public {
    require(msg.sender == recipient);
    
    address signer;
    bytes32 proof;

    signer = ecrecover(keccak256("\x19Ethereum Signed Message:\n32", h), v, r, s);
    assert(signer == sender);

    proof = keccak256(this, value);
    assert(proof == h);
    assert(value <= address(this).balance);

    recipient.transfer(value);
    selfdestruct(sender);
  }

  function channelTimeout() public {
    require(msg.sender == sender);
    assert(now > timeout);
    selfdestruct(sender);
  }
}
