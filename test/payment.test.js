const { getWeb3, getContractInstance} = require('./helpers/web3.10');
// const zephelpers = require('openzeppelin-solidity/test/helpers/advanceToBlock');
// const btt = require('./helpers/blockTimeTravel');
const web3 = getWeb3();
const getInstance = getContractInstance(web3);

contract('Payment channel test', async (accounts) => {

  it("should open channel with 1 ether in the first account", async () => {
    // get instance of contract
    const instance = getInstance("Payment");
    let channel = instance;

    // setup parameters
    const sender = accounts[0];
    const recipient = accounts[1];
    const timeout = 60*60*24;
    const value = web3.utils.toWei('1', 'ether');

    // openChannel
    const res = await channel.methods.openChannel(recipient, timeout).send({from: sender, value: web3.utils.toWei('1', 'ether')});

    // check sender
    const _sender = await channel.methods.sender().call();
    assert.equal(_sender.toLowerCase(), sender);

    // check recipient
    const _recipient = await channel.methods.recipient().call();
    assert.equal(_recipient.toLowerCase(), recipient);
    
    // check timeout
    const _timeout = await channel.methods.timeout().call();
    const block = await web3.eth.getBlock(res.blockNumber);
    assert.equal(web3.utils.hexToNumber(web3.utils.toHex(_timeout)), timeout + parseInt(block.timestamp));
  })
})