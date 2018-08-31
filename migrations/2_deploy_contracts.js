const Channel = artifacts.require('Channel');

module.exports = function(deployer, network) {
  // console.log(`network = ${network}`);
  // deployment steps
  deployer.deploy(Channel);
};