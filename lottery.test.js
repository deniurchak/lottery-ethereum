const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const { interface, bytecode } = require("../compile");

const web3 = new Web3(ganache.provider());
let accounts;
let inbox;

describe("Inbox", () => {
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    inbox = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({
        data: bytecode,
        arguments: ["Hi there!"],
      })
      .send({ from: accounts[0], gas: "1000000" });
  });

  it("deploys a contract", async () => {
    assert.ok(inbox.options.address);
  });

  it("set the initial message", async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, "Hi there!");
  });

  it("updates the message", async () => {
    await inbox.methods.setMessage("bye").send({ from: accounts[0] });
    const message = await inbox.methods.message().call();
    assert.equal(message, "bye");
  });
});
