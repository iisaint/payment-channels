const { getWeb3 } = require('./web3.10');
const web3 = getWeb3();

advanceTimeAndBlock = async (time) => {
  await advanceTime(time);
  await advanceBlock();

  return Promise.resolve(web3.eth.getBlock('latest'));
}

advanceTime = (time) => {
  return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [time],
          id: new Date().getTime()
      }, (err, result) => {
          if (err) { return reject(err); }
          return resolve(result);
      });
  });
}

advanceBlock = () => {
  return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
          jsonrpc: "2.0",
          method: "evm_mine",
          id: new Date().getTime()
      }, (err, result) => {
          if (err) { return reject(err); }
          const newBlockHash = web3.eth.getBlock('latest').hash;

          return resolve(newBlockHash)
      });
  });
}

// function advanceBlock () {
//   return new Promise((resolve, reject) => {
//     web3.currentProvider.sendAsync({
//       jsonrpc: '2.0',
//       method: 'evm_mine',
//       id: Date.now(),
//     }, (err, res) => {
//       return err ? reject(err) : resolve(res);
//     });
//   });
// }

// // Advances the block number so that the last mined block is `number`.
// async function advanceToBlock (number) {
//   if (web3.eth.blockNumber > number) {
//     throw Error(`block number ${number} is in the past (current is ${web3.eth.blockNumber})`);
//   }

//   while (web3.eth.blockNumber < number) {
//     await advanceBlock();
//   }
// }

module.exports = {
  advanceTime,
  advanceBlock,
  // advanceToBlock,
  advanceTimeAndBlock
};