const Payment = artifacts.require('Payment');

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Payment);
};