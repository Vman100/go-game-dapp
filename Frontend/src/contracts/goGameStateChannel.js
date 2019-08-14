module.exports = {
  address: '0xe0C31f03Bd6f8e8db6e15f57D47730202Bd4dbCA',
  abi: [
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "multiChannel",
		"outputs": [
			{
				"components": [
					{
						"name": "playerAddress",
						"type": "address"
					},
					{
						"name": "isWhite",
						"type": "bool"
					},
					{
						"name": "hasDeposited",
						"type": "bool"
					},
					{
						"name": "hasSubmited",
						"type": "bool"
					},
					{
						"name": "isWinner",
						"type": "bool"
					}
				],
				"name": "playerA",
				"type": "tuple"
			},
			{
				"components": [
					{
						"name": "playerAddress",
						"type": "address"
					},
					{
						"name": "isWhite",
						"type": "bool"
					},
					{
						"name": "hasDeposited",
						"type": "bool"
					},
					{
						"name": "hasSubmited",
						"type": "bool"
					},
					{
						"name": "isWinner",
						"type": "bool"
					}
				],
				"name": "playerB",
				"type": "tuple"
			},
			{
				"name": "boardSize",
				"type": "uint256"
			},
			{
				"name": "escrowAmount",
				"type": "uint256"
			},
			{
				"name": "blockNumber",
				"type": "uint256"
			},
			{
				"name": "nonce",
				"type": "uint256"
			},
			{
				"name": "currentState",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"name": "_gameState",
				"type": "string"
			},
			{
				"name": "_nonce",
				"type": "uint256"
			},
			{
				"name": "v",
				"type": "uint8"
			},
			{
				"name": "r",
				"type": "bytes32"
			},
			{
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "saveGameState",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getAvailableBoardSizes",
		"outputs": [
			{
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"name": "_gameState",
				"type": "string"
			},
			{
				"name": "_newNonce",
				"type": "uint256"
			},
			{
				"name": "v",
				"type": "uint8"
			},
			{
				"name": "r",
				"type": "bytes32"
			},
			{
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "disputeGameState",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			}
		],
		"name": "getGameStates",
		"outputs": [
			{
				"name": "",
				"type": "string[]"
			},
			{
				"name": "",
				"type": "string[2]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"name": "_boardSize",
				"type": "uint256"
			},
			{
				"name": "_isWhite",
				"type": "bool"
			}
		],
		"name": "startNewGame",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_gameId",
				"type": "uint256"
			}
		],
		"name": "joinGame",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "requiredDeposit",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "oldState",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "newState",
				"type": "string"
			}
		],
		"name": "StateChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_boardSize",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_isWhite",
				"type": "bool"
			}
		],
		"name": "NewGame",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_isWhite",
				"type": "bool"
			}
		],
		"name": "GameJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "Deposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_receivedGameState",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "_player",
				"type": "address"
			}
		],
		"name": "NewGameStateReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_newGameState",
				"type": "string"
			}
		],
		"name": "NewGameStateSaved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_gameId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	}
]
}
