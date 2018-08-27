const Payment = artifacts.require('Payment');

module.exports = function(deployer, network) {
  console.log(`network = ${network}`);
  // deployment steps
  deployer.deploy(Payment);
};