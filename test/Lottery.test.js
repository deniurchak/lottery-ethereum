const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile.js");

let accounts;
let lottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  const gas = (10 ** 6).toString();

  from = accounts[0];
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({ from, gas });
});

describe("Lottery Contract", () => {
  it("deploys the contract", async () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 1);
    assert.equal(players[0], accounts[0]);
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 2);
    assert.equal(players[0], accounts[0]);
    assert.equal(players[1], accounts[1]);
  });

  it("does not allow account to enter without enough money", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.01", "ether"),
      });
      assert.fail("Expected transaction to fail");
    } catch (err) {
      assert(err);
    }
  });
  it("allows manager to pick winner", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("0.018", "ether")); // Account for gas costs

    const players = await lottery.methods.getPlayers().call();
    assert.equal(players.length, 0);
  });

  it("only manager can pick winner", async () => {
    try {
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      assert.fail("Expected transaction to fail");
    } catch (err) {
      assert(err);
    }
  });

  it("send money to the winner", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    const res = await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    assert(difference > web3.utils.toWei("1.8", "ether")); // Account for gas costs
  });
});
