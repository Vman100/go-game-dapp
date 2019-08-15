/*global contract, config, it, assert*/
const goGameStateChannel = require('Embark/contracts/goGameStateChannel');;

function didRevertCorrectly(actualError, expectedError) {
  return actualError.includes(expectedError);
}

const sign = async (gameId, gameNonce, nonce, winnerAddress, signer, contractAddress) => {
	const gameState = `gameNonce:${gameNonce},isGameFinished:true,winnerAddress:${winnerAddress}`
  let message = web3.utils.soliditySha3(gameId, gameState, nonce, contractAddress)
  let sig = await web3.eth.sign(message, signer)
  sig = sig.split('x')[1]
  let splitSig = {
    r: '0x' + sig.substring(0, 64),
    s: '0x' + sig.substring(64, 128),
    v: (parseInt(sig.substring(128, 130)) + 27).toString(),
  }
  return {gameId, nonce, gameState, ...splitSig}
}

function createExpectedErrorMessages(data) {
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
    "hasSubmited": data.hasSubmited + ' has already submited',
    "boardSize": "given boardSize is not available",
    "secondCaller": "caller must be a different address",
    "dispostMatch": "deposit must match required amount",
    "isPlayer": "caller is not a player of the associated game id",
    "signatureCheck": "The caller's address and the signer's address must match",
    "disputePeriod": "The game state must be submited within dispute period"
  }
}

let accounts;

// For documentation please see https://embark.status.im/docs/contracts_testing.html
config({
  // deployment: {
  //   host: 'localhost',
  //   port: '8545',
  //   type: "rpc",
  // },
  contracts: {
    "Integers": { 
      deploy: true
    },
    goGameStateChannel: {}
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("goGameStateChannel", function () {
  this.timeout(0);
  let gameId = 1, arg, result, log, actual, expected

  afterEach(function(){
    gameId++
  })

  it('caller can start new game', async function() {
    result = await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    log = result.events.NewGame;
    actual = {
      gameId: Number(log.returnValues[0]),
      player: log.returnValues[1],
      boardSize: Number(log.returnValues[2]),
      isWhite: log.returnValues[3]
    }
    expected = {
      gameId,
      player: accounts[0],
      boardSize: 9,
      isWhite: true
    }
    assert.deepStrictEqual(actual, expected)
  });
  
  it('caller can only start new game during setup', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    try {
      await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({state: 'SETUP'})["stateCheck"]))
    }
  });

  it('caller cannot start new game at existing id', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    try {
      await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({isGameIdExists: true})["isGameIdExists"]))
    }
  });
  
  it('only an available boardSize can be set for new game', async function() {
    try {
      await goGameStateChannel.methods.startNewGame(gameId,30,true).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({})["boardSize"]))
    }
  });

  it('caller can join game', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    result = await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    log = result.events.GameJoined;
    actual = {
      gameId: Number(log.returnValues[0]),
      player: log.returnValues[1],
      isWhite: log.returnValues[2]
    }
    expected = {
      gameId,
      player: accounts[1],
      isWhite: false
    }
    assert.deepStrictEqual(actual, expected)
  });

  it('caller can only join game during setup', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    try {
      await goGameStateChannel.methods.joinGame(gameId).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({state: 'SETUP'})["stateCheck"]))
    }
  });

  it('caller cannot join game at non existing id', async function() {
    try {
      await goGameStateChannel.methods.joinGame(gameId).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({isGameIdExists: false})["isGameIdExists"]))
    }
  });

  it('join game caller address cannot match creator address', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    try {
      await goGameStateChannel.methods.joinGame(gameId).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({})["secondCaller"]))
    }
  });

  it('player can deposit', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    result = await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    log = result.events.Deposited;
    actual = {
      gameId: Number(log.returnValues[0]),
      player: log.returnValues[1],
      value: log.returnValues[2]
    }
    expected = {
      gameId,
      player: accounts[0],
      value: web3.utils.toWei('2')
    }
    assert.deepStrictEqual(actual, expected)
  });

  it('player can only deposit during setup', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    try {
      await goGameStateChannel.methods.deposit(gameId).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({state: 'SETUP'})["stateCheck"]))
    }
  });

  it('non player cannot deposit', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    try {
      await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[3]});
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({})["isPlayer"]))
    }
  });

  it('only required amount can be deposited', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    try {
      await goGameStateChannel.methods.deposit(gameId).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({})["dispostMatch"]))
    }
  });

  it('player can only deposit once', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')});
    try {
      await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')});
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({hasDeposited: 'playerA'})["hasDeposited"]))
    }
  });

  it('player can submit game state while playing', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,1,1,accounts[0],accounts[0], goGameStateChannel.options.address)
    result = await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    log = result.events.NewGameStateReceived;
    actual = {
      gameId: Number(log.returnValues[0]),
      gameState: log.returnValues[1],
      player: log.returnValues[2]
    }
    expected = {
      gameId,
      gameState: arg.gameState,
      player: accounts[0]
    }
    assert.deepStrictEqual(actual, expected)
  });

  it('player can only submit game state while playing', async function() {
    arg = await sign(gameId,1,1,accounts[0],accounts[0], goGameStateChannel.options.address)
    try {
      await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({ state: 'PLAYING'})["stateCheck"]))
    }
  });

  it('player cannot submit game state with invalid signature nonce while playing', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,1,2,accounts[0],accounts[0], goGameStateChannel.options.address)
    try {
      await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({signatureNonce: 'invalid'})["signatureNonce"]))
    }
  });

  it('player cannot submit game state with old nonce while playing', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,0,0,accounts[0],accounts[0], goGameStateChannel.options.address)
    try {
      await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({signatureNonce: 'old'})["signatureNonce"]))
    }
  });

  it('player address must match signer address to submit game state while playing', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,1,1,accounts[0],accounts[1], goGameStateChannel.options.address)
    try {
      await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({})["signatureCheck"]))
    }
  });

  it('player can only submit game state once while playing', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,1,1,accounts[0],accounts[0], goGameStateChannel.options.address)
    await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    try {
      await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({hasSubmited: 'playerA'})["hasSubmited"]))
    }
  });

  it('player can submit game state during dispute period', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,1,1,accounts[0],accounts[0], goGameStateChannel.options.address)
    await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    arg = await sign(gameId,1,1,accounts[1],accounts[1], goGameStateChannel.options.address)
    await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send({from: accounts[1]})
    arg = await sign(gameId,2,2,accounts[0],accounts[0], goGameStateChannel.options.address)      
    result = await goGameStateChannel.methods.disputeGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    log = result.events.NewGameStateReceived;
    actual = {
      gameId: Number(log.returnValues[0]),
      gameState: log.returnValues[1],
      player: log.returnValues[2]
    }
    expected = {
      gameId,
      gameState: arg.gameState,
      player: accounts[0]
    }  
    assert.deepStrictEqual(actual, expected) 
  });

  it('player can only dispute game state in dispute state', async function() {
    arg = await sign(gameId,1,1,accounts[0],accounts[0], goGameStateChannel.options.address)
    try {
      await goGameStateChannel.methods.disputeGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({ state: 'DISPUTE'})["stateCheck"]))
    }
  });

  it('player can trigger transfer', async function() {
    await goGameStateChannel.methods.startNewGame(gameId,9,true).send();
    await goGameStateChannel.methods.joinGame(gameId).send({from: accounts[1]});
    await goGameStateChannel.methods.deposit(gameId).send({ value: web3.utils.toWei('2')})
    await goGameStateChannel.methods.deposit(gameId).send({ from: accounts[1], value: web3.utils.toWei('2')})
    arg = await sign(gameId,1,1,accounts[0],accounts[0], goGameStateChannel.options.address)
    await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send()
    arg = await sign(gameId,1,1,accounts[0],accounts[1], goGameStateChannel.options.address)
    await goGameStateChannel.methods.saveGameState(arg.gameId, arg.gameState, arg.nonce, arg.v, arg.r, arg.s).send({from: accounts[1]})
    result = await goGameStateChannel.methods.transfer(gameId).send();
    log = result.events.Transfer;
    actual = {
      gameId: Number(log.returnValues[0]),
      winnerAddress: log.returnValues[1],
      escrowAmount: log.returnValues[2]
    }
    expected = {
      gameId,
      winnerAddress: accounts[0],
      escrowAmount: web3.utils.toWei('4')
    }
    assert.deepStrictEqual(actual, expected)
  });

  it('player can only transfer in finished state', async function() {
    try {
      await goGameStateChannel.methods.transfer(gameId).send();
    } catch (error) {
      assert.ok(didRevertCorrectly(error.message,createExpectedErrorMessages({state: 'FINISHED'})["stateCheck"]))
    }
  });
});
