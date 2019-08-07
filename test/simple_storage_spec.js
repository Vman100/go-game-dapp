/*global contract, config, it, assert*/
const goGameStateChannel = require('Embark/contracts/goGameStateChannel');
const Integers = require('Embark/contracts/Integers.sol');

function didRevertCorrectly(actualError, expectedError) {
  return actualError.includes(expectedError);
}

function createErrorMessages(data) {
  let isGameIdExists
  let signatureNonce
  if(data.isGameIdExists) {
    isGameIdExists = "game at given id exists"
  } else{
    isGameIdExists = "game at given id does not exist"
  }
  if(data.signatureNonce === 'invalid') {
    signatureNonce = "signature nonce is invalid"
  } else {
    signatureNonce = "signature nonce must be greater then current nonce"
  }
  return {
    "stateCheck": 'current state does not match required state ' + data.state,
    isGameIdExists,
    "hasDeposited": data.hasDeposited + ' has already deposited',
    signatureNonce,
    "hasSubmitted": data.hasSubmitted + ' has already submitted'
  }
}
const expectedErrorMessages = {
  "boardSize": "given boardSize is not available",
  "secondCaller": "caller must be a different address",
  "dispostMatch": "deposit must match required amount",
  "isPlayer": "caller is not a player of the associated game id",
  "signatureCheck": "The caller's address and the signer's address must match",
  "disputePeriod": "The game state must be submited within dispute period"
}

let accounts;

// For documentation please see https://embark.status.im/docs/contracts_testing.html
config({
  // deployment: {
  //   host: "localhost",
  //   port: 8545,
  //   type: "rpc"
  // },
  contracts: {
    "Integers": { 
      deploy: true
    },
    "goGameStateChannel": {
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("goGameStateChannel", function () {
  this.timeout(0);
  
  it('only an available boardSize can be set', async function() {
    try {
      await goGameStateChannel.methods.startNewGame(1,30,true).send({from: accounts[1]});
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,expectedErrorMessages["BoardSize"]))
    }
  });

  it('transfer can only be done in finished state', async function() {
    try {
      await goGameStateChannel.methods.transfer(1).send({from: accounts[1]});
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createErrorMessages({ state: 'FINISHED', isGameIdExists: true})["stateCheck"]))
    }
  });

  it('disputeGameState function can only be used in dispute state', async function() {
    try {
      await goGameStateChannel.methods.disputeGameState(1,"gamestate,nonce:4",8,28,).send({from: accounts[1]});
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createErrorMessages({ state: 'DISPUTE', isGameIdExists: true})["stateCheck"]))
    }
  });

  it('transfer function can only be used in finished state', async function() {
    try {
      await goGameStateChannel.methods.transfer(1).send({from: accounts[1]});
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createErrorMessages({ state: 'FINISHED', isGameIdExists: true})["stateCheck"]))
    }
  });
  
  it('can start new game', async function() {
    let result = await goGameStateChannel.methods.startNewGame(1,9,true).send({from: accounts[1]});
    let log = result.events.NewGame;
    let actual = {
      gameId: Number(log.returnValues[0]),
      player: log.returnValues[1],
      boardSize: Number(log.returnValues[2]),
      isWhite: log.returnValues[3]
    }
    let expected = {
      gameId: 1,
      player: accounts[1],
      boardSize: 9,
      isWhite: true
    }
    assert.deepStrictEqual(actual, expected)
  });

  

  // it('should have access to Storage functions', async function() {
  //   const hash = await EmbarkJS.Storage.saveText('myText');
  //   const text = await EmbarkJS.Storage.get(hash);
  //   assert.strictEqual(text, 'myText');
  // });

  // it("should set constructor value", async function () {
  //   let result = await SimpleStorage.methods.storedData().call();
  //   assert.strictEqual(parseInt(result, 10), 100);
  // });

  // it("set storage value", async function () {
  //   await SimpleStorage.methods.set(150).send();
  //   let result = await SimpleStorage.methods.get().call();
  //   assert.strictEqual(parseInt(result, 10), 150);
  // });

  // it("should have account with balance", async function() {
  //   let balance = await web3.eth.getBalance(accounts[0]);
  //   assert.ok(parseInt(balance, 10) > 0);
  // });
});
