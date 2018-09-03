pragma solidity ^0.4.24;

contract BidirectionalChannel {
  address public sender;
  address public recipient;
  uint public senderBalance;
  uint public recipientBalance;
  uint public timeout;

  function openChannel(address _recipient, uint _timeout) public payable {
    require(_recipient != 0x0);
    require(_timeout > 0);
    require(msg.value > 0);
    sender = msg.sender;
    recipient = _recipient;
    timeout = now + _timeout;
    senderBalance = msg.value;
  }

  function joinChannel() public payable {
    require(msg.sender == recipient);
    require(recipientBalance == 0);
    require(msg.value > 0);
    recipientBalance = msg.value;
  }

  function closeChannel(bytes32 h, uint8 v, bytes32 r, bytes32 s, uint senderValue, uint recipientValue, uint timeLock) public {
    require(msg.sender == sender || msg.sender == recipient);
    address signer;
    bytes32 proof;

    signer = ecrecover(keccak256("\x19Ethereum Signed Message:\n32", h), v, r, s);
    assert(signer == sender || signer == recipient);
    proof = keccak256(this, senderValue, recipientValue, timeLock);
    assert(proof == h);
    assert(now > timeLock);
    assert((senderValue + recipientValue) == (senderBalance + recipientBalance));

    if (recipientValue > 0) {
      recipient.transfer(recipientValue);
    }
    selfdestruct(sender);
  }

  function channelTimeout() public {
    require(msg.sender == sender);
    assert(now > timeout);
    selfdestruct(sender);
  }

  function() public {
    revert();
  }

}