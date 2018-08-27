const { getWeb3, getContractInstance} = require('./helpers/web3.10');
const web3 = getWeb3();
const getInstance = getContractInstance(web3);

contract('Payment channel test', async (accounts) => {

  it("should open channel with 1 ether in the first account", async () => {
    const sender = accounts[0];
    const recipient = accounts[1];
    // let instance = await Payment.deployed();
    const instance = getInstance("Payment");
    let channel = instance;
    const timeout = 60*60*24;
    const value = web3.utils.toWei('1', 'ether');
    await channel.methods.openChannel(recipient, timeout).send({from: sender, value: web3.utils.toWei('1', 'ether')});
    const _sender = await channel.methods.sender().call();
    console.log(_sender);
    const _recipient = await channel.methods.recipient().call();
    const _timeout = await channel.methods.timeout().call();
    assert.equal(_sender.toLowerCase(), sender);
    assert.equal(_recipient.toLowerCase(), recipient);
    // assert.equal(web3.utils.hexToNumber(web3.utils.toHex(_timeout)), timeout);
  })
})