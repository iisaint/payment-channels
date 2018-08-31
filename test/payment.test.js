const { getWeb3, getContractInstance} = require('./helpers/web3.10');
const ethUtil = require('ethereumjs-util');
// const zephelpers = require('openzeppelin-solidity/test/helpers/advanceToBlock');
// const btt = require('./helpers/blockTimeTravel');
const web3 = getWeb3();
const getInstance = getContractInstance(web3);

contract('Payment channel test', async (accounts) => {
  // get instance of contract
  const instance = getInstance("Payment");
  let channel = instance;
  
  // private key copied from 'ganache-cli -d'
  const pkeys = [
    '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
    '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
    '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c',
    '0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913',
    '0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743',
    '0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd',
    '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
    '0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3',
    '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4',
    '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773'
  ]

  // setup parameters
  const sender = accounts[0];
  const recipient = accounts[1];
  const timeout = 60*60*24;
  const deposit = web3.utils.toBN(web3.utils.toWei('1', 'ether'));
  

  it("should open channel with 1 ether in the first account", async () => {
    // openChannel
    const res = await channel.methods.openChannel(recipient, timeout).send({from: sender, value: deposit});

    // check sender
    const _sender = await channel.methods.sender().call();
    assert.strictEqual(_sender.toLowerCase(), sender);

    // check recipient
    const _recipient = await channel.methods.recipient().call();
    assert.strictEqual(_recipient.toLowerCase(), recipient);
    
    // check timeout
    const _timeout = await channel.methods.timeout().call();
    const block = await web3.eth.getBlock(res.blockNumber);
    assert.strictEqual(web3.utils.hexToNumber(web3.utils.toHex(_timeout)), timeout + parseInt(block.timestamp));
  })

  it('should close channel after send a proof by recipient', async () => {
    // get current balances
    let senderBalance = await web3.eth.getBalance(sender);
    senderBalance = web3.utils.toBN(senderBalance);
    let recipientBalance = await web3.eth.getBalance(recipient);
    recipientBalance = web3.utils.toBN(recipientBalance);
    let channelBalance = await web3.eth.getBalance(channel.options.address);
    channelBalance = web3.utils.toBN(channelBalance);
    
    // sign a message for 0.1 eth
    let amount = web3.utils.toBN(web3.utils.toWei('0.1', 'ether'));
    const channelAddress = channel.options.address;

    // prepare off-chain transaction, sign(sha3(channel, amount), sender)
    let digest = web3.utils.soliditySha3({
      t: 'address',
      v: channelAddress
    },{
      t: 'uint256',
      v: amount
    });
    // sign the digest with sender
    const sig = await web3.eth.accounts.sign(digest, pkeys[0]);
    
    let result = await channel.methods.closeChannel(digest, web3.utils.toDecimal(sig.v), sig.r, sig.s, amount).send({from: recipient});
    assert.isTrue(result.status, 'colseChannel transacton should be true');

    // check both balance
    let _senderBalance = await web3.eth.getBalance(sender);
    _senderBalance = web3.utils.toBN(_senderBalance);
    let _recipientBalance = await web3.eth.getBalance(recipient);
    _recipientBalance = web3.utils.toBN(_recipientBalance);
    let tx = await web3.eth.getTransaction(result.transactionHash);
    let fee = web3.utils.toBN(result.gasUsed).mul(web3.utils.toBN(tx.gasPrice));

    assert.strictEqual(senderBalance.add(channelBalance).sub(amount).toString(), _senderBalance.toString(), `sender balance should minus ${amount}`);
    assert.strictEqual(recipientBalance.add(amount).sub(fee).toString(), _recipientBalance.toString(), `recipient balance should add ${amount}`);

  })
})
