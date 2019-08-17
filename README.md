# Go Game Dapp

The Use Case is to resolve trust issues with a third party holding the funds of the players and acting as the game's referee for cases of cheating along witth handling disputes and tranfers of funds.

The blockchain is used to control and monitor the game state as a referee for the game.

The contact uses combination of my library and the solidity-utils library authored by James Lockhart.

## getting started 

1. Clone this repository `git clone https://github.com/Vman100/go-game-dapp`
2. change to desired folder
3. run the command `npm install`
4. navigate to Backend/function folder and run the command `npm install`
5. at current location run the command `npm serve` or `npm run serve`
6. on different terminal run the command `npm start-react` or `npm run start-react`
7. open browser to specified port, typically `localhost:3000`

## Backend endpoints
there are three endpoints available on the backend, two of which connect to the database with third endpoint used for funding via the gitter api.

### Users
This endpoint is used for storing and retrieving user login info such email as username and passwordhash.

### Games
This endpoint is used for storing and retrieving game data such as the user's wallet address and other game related info for use off-chain.

## constract functions

There are a total of ten public functions four of which are getter functions. All public functions that accepts at least one argument has uint gameId set as the first argument and uses the gameId argument to select the state channel. 

Both **saveGameState** and **disputeGameState** functions  use the uint gameId, the uint nonce, and the contract address for cross-channel, replay, and cross-contract attacks respectively along with using the gameId, nonce, contract address, gameState string, and the uint8 v, bytes32 r, and bytes32 s expanded signature values to check that the recovered signer address matches the caller's address.

---

The **startNewGame** function accepts three arguments, two uint's and a boolean, and can only be used in the setup state. Calling the function sets the first player's address as the caller's address, the uint board size based on predefined array of available sizes and the caller's selected color based on the boolean value by the uint gameId. No return value is expected but a log containing the gameId,caller's address, selected board size, and the caller's boolean color value is emitted.

The **joinGame** function accepts one argument, an uint, and can only be used in the setup state. Calling the function sets the second player's address as the caller's address, and caller's color based on the fist player's selection by the uint gameId. No return value is expected but log containing the caller's address, the gameId, and the caller's boolean color value is emitted.

The payable **deposit** function accepts one argument, an uint, and can only be used in the setup state. Calling the function saves the amount deposited by the caller to the escrow amount by the uint gameId then changes the current state from setup to playing by gameId, if both players have deposited the required amount defined. No return value is expected but one or two logs is emitted where one contains the gameId, the caller's address, and the amount deposited while the other log contains the gameId, the old state and the new state.

The **saveGameState** function accepts six arguments, two uint's, a string, a uint8, and two bytes32's. The function can only be used in the playing state. Calling the function causes the string gameState to be saved in the fixed-size receivedGameState array by gameId then if both players have submitted updates the nonce, and compares the two gameState strings. one of the gameStates is saved to the dynamically-sized savedGameStates array by gameId if the compared gameStates match then if the game is finished, checks and sets who won along changing the state from playing to finished. If the compared gameStates do not match, the current state is changed to dispute with the current block number saved. No return value is expected but one to three logs are emitted with the first log containing the gameId, received gameState, and caller's address, the second log containing the gameId, and saved gameState, and the third log containing the gameId, the old state, and the new state.

The **disputeGameState** function works similar to the **saveGameState** function except this function can only be used in the dispute state within a predefined dispute period. if the function is called outside the dispute period then the current state will be changed to finished with the game ending in a draw otherwise the function flows similar to the **saveGameState** function but changes the current state to playing if the compared gameState strings match otherwise if the dispute period is about to end then the state is changed to finished with the game ending in a draw. No return value is expected but log are emitted similar to the **saveGameState** function.

The **transfer** function accepts one argument, an uint, and can only be used in the finished state. Calling the function causes winner address to receive the escrow amount by gameId or both players receive their initial deposits in the case of a draw, and resets channel details along with the state from finished to setup by gameId. No return value is expected but two logs are emitted with the log containing the gameId, the player address, and received amount is emitted when a draw occurs and the other log cotaining the gameId, the old state, and the new state.

The **getAvailableBoardSizes** function accepts no arguments and returns an array of the available board sizes.

The **requiredDeposit** function accepts no arguments and returns the required deposit amount in wei.

The **mutlichannel** function accepts one argument, an uint, and returns the channel details execept the gameState string arrays by gameId.

The **getGameStates** function accepts one argument, an uint, and returns the saveGameStates and receivedGameStates string arrays by gameId.

## Links

---
solidity-utils library: https://github.com/willitscale/solidity-util

Network: kovan

deployed Tx: https://kovan.etherscan.io/tx/0x2f98a4298e69a68dd945c2b42b535f781d1c30a7abb876836582e554700883e4

hosted at: https://go-game-dapp.web.app and https://go-game-dapp.firebaseapp.com
---
Created By: Vedran Tepavcevic