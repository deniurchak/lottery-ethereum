const path = require("path");
const fs = require("fs");
const solc = require("solc");

try {
  const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
  const source = fs.readFileSync(lotteryPath, "utf8");
  
  const input = {
    language: 'Solidity',
    sources: {
      'Lottery.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = output.contracts['Lottery.sol'].Lottery;

  module.exports = {
    interface: JSON.stringify(contract.abi),
    bytecode: contract.evm.bytecode.object,
  };
} catch (error) {
  console.error("Error compiling contract:", error);
  process.exit(1);
}
