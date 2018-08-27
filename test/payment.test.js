const Payment = artifacts.require("payment");
const web3 = require('web3');

contract('Payment channel test', async (accounts) => {

  it("should open channel with 1 ether in the first account", async () => {
    const sender = accounts[0];
    const recipient = accounts[1];
    let instance = await Payment.deployed();
    let channel = instance;
    const timeout = 60*60*24;
    const value = web3.utils.toWei('1', 'ether');
    await channel.openChannel(recipient, timeout, {from: sender, value: web3.utils.toWei('1', 'ether')});
    const _sender = await channel.sender.call();
    const _recipient = await channel.recipient.call();
    const _timeout = await channel.timeout.call();
    assert.equal(_sender, sender);
    assert.equal(_recipient, recipient);
    // assert.equal(web3.utils.hexToNumber(web3.utils.toHex(_timeout)), timeout);
  })
})