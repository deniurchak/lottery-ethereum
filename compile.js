const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");

const source = fs.readFileSync(lotteryPath, "utf8");

const compiled = solc.compile(source, 1);

module.exports = compiled.contracts[":Lottery"];
