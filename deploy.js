require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
  process.env.MNEMONIC,
  process.env.INFURA_ENDPOINT
);

const web3 = new Web3(provider);

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log("Deploying from", accounts[0]);

    const contract = new web3.eth.Contract(JSON.parse(interface));
    const deploy = contract.deploy({
      data: bytecode,
    });

    const result = await deploy.send({
      from: accounts[0],
      gas: "1000000",
    });

    console.log("Contract deployed to", result.options.address);
  } catch (error) {
    console.error("Error deploying contract:", error);
    process.exit(1);
  } finally {
    provider.engine.stop();
  }
};

deploy();
