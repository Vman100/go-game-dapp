pragma solidity 0.5.4;
//pragma experimental ABIEncoderV2;

import "solidity-util/lib/Strings.sol";
import "solidity-util/lib/Integers.sol";

library Utils {
    function parseAddr(string memory _a) internal pure returns(address _parsedAddress) {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }

    function contains(string memory _base, string memory _subString) internal pure returns(bool, uint) {
        bytes memory baseBytes = bytes (_base);
        bytes memory subStringBytes = bytes (_subString);
        bool found = false;
        uint index;
        for (uint i = 0; i < baseBytes.length - subStringBytes.length; i++) {
            bool flag = true;
            for (uint j = 0; j < subStringBytes.length; j++) {
                if (baseBytes[i + j] != subStringBytes[j]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                found = true;
                index = i;
                break;
            }
        }
        return (found, index);
    }
}

contract goGameStateChannel {
    using Strings for string;
    using Utils for string;
    using Integers for uint;
    enum State { SETUP, PLAYING, DISPUTE, FINISHED }
    uint public requiredDeposit = 2 * 10 ** 18;

    uint[] availableBoardSizes = [5, 6, 7, 8, 9, 11, 13, 15, 19];

    struct Player {
        address payable playerAddress;
        bool isWhite;
        bool hasDeposited;
        bool hasSubmited;
        bool isWinner;
    }

    struct Channel {
        Player playerA;
        Player playerB;
        uint boardSize;
        uint escrowAmount;
        uint blockNumber;
        uint nonce;
        string[] savedGameStates;
        string[2] receivedGameStates;
        State currentState;
    }

    mapping(uint256 => Channel) multiChannel;

    event StateChanged(uint _gameId, string oldState, string newState);
    event NewGame(uint _gameId, address _player, uint _boardSize, bool _isWhite);
    event GameJoined(uint _gameId, address _player, bool _isWhite);
    event Deposited(uint _gameId, address _player, uint _amount);
    event NewGameStateReceived(uint _gameId, string _receivedGameState, address _player);
    event NewGameStateSaved(uint _gameId, string _newGameState);
    event Transfer(uint _gameId, address _player, uint _amount);

    modifier checkState(uint _gameId, State _currentState) {
        string memory errorString;
        if(_currentState == State.SETUP) {
            errorString = 'current state does not match required state SETUP';
        } else if(_currentState == State.PLAYING) {
            errorString = 'current state does not match required state PLAYING';
        } else if(_currentState == State.DISPUTE) {
            errorString = 'current state does not match required state DISPUTE';
        } else {
            errorString = 'current state does not match required state FINISHED';
        }
        require(multiChannel[_gameId].currentState == _currentState, errorString);
        _;
    }

    modifier isPlayer(uint _gameId) {
        require(multiChannel[_gameId].playerA.playerAddress == msg.sender ||
        multiChannel[_gameId].playerB.playerAddress == msg.sender, 'caller is not a player of the associated game id');
        _;
    }

    function checkGameState(string memory _gameState, string memory _searchString, uint length) private pure returns(string memory){
        (bool result, uint index) = _gameState.contains(_searchString);
        if(result) {
            return _gameState._substring(int(length), int(index + _searchString.length() + 1));
        }
        return 'error substring not found';
    }

    function checkBoardSize(uint _boardSize) private view returns(bool){
        for(uint i = 0; i < availableBoardSizes.length; i++) {
            if(_boardSize == availableBoardSizes[i]) {
                return true;
            }
        }
    }

    // function getGameStates(uint _gameId) public view returns(string[] memory, string[2] memory) {
    //     return (multiChannel[_gameId].savedGameStates, multiChannel[_gameId].receivedGameStates);
    // }

    function getAvailableBoardSizes() public view returns(uint[] memory){
        return availableBoardSizes;
    }

    function startNewGame(uint _gameId, uint _boardSize, bool _isWhite) public checkState(_gameId, State.SETUP) {
        require(multiChannel[_gameId].playerA.playerAddress == address(0), 'game at given id exists');
        require(checkBoardSize(_boardSize), 'given boardSize is not available');
        multiChannel[_gameId].playerA.playerAddress = msg.sender;
        multiChannel[_gameId].boardSize = _boardSize;
        if(_isWhite){
            multiChannel[_gameId].playerA.isWhite = _isWhite;
        }
        emit NewGame(_gameId, msg.sender, _boardSize, _isWhite);
    }

    function joinGame(uint _gameId) public checkState(_gameId, State.SETUP) {
        require(multiChannel[_gameId].playerA.playerAddress != address(0), 'game at given id does not exist');
        require(multiChannel[_gameId].playerA.playerAddress != msg.sender, 'caller must be a different address');
        multiChannel[_gameId].playerB.playerAddress = msg.sender;
        if(!multiChannel[_gameId].playerA.isWhite) {
            multiChannel[_gameId].playerB.isWhite = true;
        }
        emit GameJoined(_gameId, msg.sender, multiChannel[_gameId].playerB.isWhite);
    }

    function deposit(uint _gameId) public payable checkState(_gameId, State.SETUP) isPlayer(_gameId) {
        require(msg.value == requiredDeposit, 'deposit must match required amount');
        require(multiChannel[_gameId].escrowAmount + msg.value > multiChannel[_gameId].escrowAmount, 'escrowAmount overflow');
        if(multiChannel[_gameId].playerA.playerAddress == msg.sender) {
            require(!multiChannel[_gameId].playerA.hasDeposited, 'playerA has already deposited');
            multiChannel[_gameId].playerA.hasDeposited = true;
        } else {
            require(!multiChannel[_gameId].playerB.hasDeposited, 'playerB has already deposited');
            multiChannel[_gameId].playerB.hasDeposited = true;
        }
        multiChannel[_gameId].escrowAmount += msg.value;
        emit Deposited(_gameId, msg.sender, msg.value);
        if(multiChannel[_gameId].playerA.hasDeposited && multiChannel[_gameId].playerB.hasDeposited) {
            multiChannel[_gameId].currentState = State.PLAYING;
            emit StateChanged(_gameId, 'SETUP', 'PLAYING');
        }
    }

    function saveGameState(uint _gameId, string memory _gameState, uint _nonce,
    uint8 v, bytes32 r, bytes32 s) public checkState(_gameId, State.PLAYING) isPlayer(_gameId) {
        require(Integers.parseInt(checkGameState(_gameState,"gameNonce", _nonce.toString().length())) == _nonce, "signature nonce is invalid");
        require(_nonce > multiChannel[_gameId].nonce, "signature nonce must be greater then current nonce");
        bytes32 messageHash = keccak256(abi.encodePacked(_gameId, _gameState, _nonce, address(this)));
        bytes32 messageHash2 = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32", messageHash
        ));
        require(ecrecover(messageHash2, v, r, s) == msg.sender, "The caller's address and the signer's address must match");
        if(multiChannel[_gameId].playerA.playerAddress == msg.sender) {
            require(!multiChannel[_gameId].playerA.hasSubmited, 'playerA has already submited');
            multiChannel[_gameId].playerA.hasSubmited = true;
            multiChannel[_gameId].receivedGameStates[0] = _gameState;
        } else {
            require(!multiChannel[_gameId].playerB.hasSubmited, 'playerB has already submited');
            multiChannel[_gameId].playerB.hasSubmited = true;
            multiChannel[_gameId].receivedGameStates[1] = _gameState;
        }
        emit NewGameStateReceived(_gameId, _gameState, msg.sender);
        if(multiChannel[_gameId].playerA.hasSubmited && multiChannel[_gameId].playerB.hasSubmited) {
            multiChannel[_gameId].nonce = _nonce;
            if(!multiChannel[_gameId].receivedGameStates[0].compareTo(multiChannel[_gameId].receivedGameStates[1])) {
                multiChannel[_gameId].blockNumber = block.number;
                delete multiChannel[_gameId].playerA.hasSubmited;
                delete multiChannel[_gameId].playerB.hasSubmited;
                delete multiChannel[_gameId].receivedGameStates;
                multiChannel[_gameId].currentState = State.DISPUTE;
                emit StateChanged(_gameId, 'PLAYING', 'DISPUTE');
            } else {
                multiChannel[_gameId].savedGameStates.push(_gameState);
                delete multiChannel[_gameId].playerA.hasSubmited;
                delete multiChannel[_gameId].playerB.hasSubmited;
                delete multiChannel[_gameId].receivedGameStates;
                emit NewGameStateSaved(_gameId, _gameState);
                if(checkGameState(_gameState,"isGameFinished", 4).compareTo('true')) {
                    if(checkGameState(_gameState,"winnerAddress", 42).parseAddr() == multiChannel[_gameId].playerA.playerAddress){
                        multiChannel[_gameId].playerA.isWinner = true;
                    } else {
                        multiChannel[_gameId].playerB.isWinner = true;
                    }
                    multiChannel[_gameId].currentState = State.FINISHED;
                    emit StateChanged(_gameId, 'PLAYING', 'FINISHED');
                }
            }
        }
    }

    function disputeGameState(uint _gameId, string memory _gameState, uint _newNonce,
    uint8 v, bytes32 r, bytes32 s) public checkState(_gameId, State.DISPUTE) isPlayer(_gameId) { // takes signature
        if(block.number >= multiChannel[_gameId].blockNumber + 21) {
            if(multiChannel[_gameId].playerA.hasSubmited) {
                delete multiChannel[_gameId].playerA.hasSubmited;
            } else {
                delete multiChannel[_gameId].playerB.hasSubmited;
            }
            delete multiChannel[_gameId].receivedGameStates;
            delete multiChannel[_gameId].blockNumber;
            multiChannel[_gameId].currentState = State.FINISHED;
            emit StateChanged(_gameId, 'DISPUTE', 'FINISHED');
        } else {
            require(block.number < multiChannel[_gameId].blockNumber + 21, "The game state must be submited within dispute period");
            require(Integers.parseInt(checkGameState(_gameState,"gameNonce", _newNonce.toString().length())) == _newNonce, "signature nonce is invalid");
            require(_newNonce > multiChannel[_gameId].nonce, "signature nonce must be greater then current nonce");
            bytes32 messageHash = keccak256(abi.encodePacked(_gameId, _gameState, _newNonce, address(this)));
            bytes32 messageHash2 = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
            require(ecrecover(messageHash2, v, r, s) == msg.sender, "The caller's address and the signer's address must match");
            if(multiChannel[_gameId].playerA.playerAddress == msg.sender) {
                require(!multiChannel[_gameId].playerA.hasSubmited, 'playerA has already submited');
                multiChannel[_gameId].playerA.hasSubmited = true;
                multiChannel[_gameId].receivedGameStates[0] = _gameState;
            } else {
                require(!multiChannel[_gameId].playerB.hasSubmited, 'playerB has already submited');
                multiChannel[_gameId].playerB.hasSubmited = true;
                multiChannel[_gameId].receivedGameStates[1] = _gameState;
            }
            emit NewGameStateReceived(_gameId, _gameState, msg.sender);
            if(multiChannel[_gameId].playerA.hasSubmited && multiChannel[_gameId].playerB.hasSubmited) {
                multiChannel[_gameId].nonce = _newNonce;
                if(multiChannel[_gameId].receivedGameStates[0].compareTo(multiChannel[_gameId].receivedGameStates[1])) {
                    multiChannel[_gameId].savedGameStates.push(_gameState);
                    delete multiChannel[_gameId].playerA.hasSubmited;
                    delete multiChannel[_gameId].playerB.hasSubmited;
                    delete multiChannel[_gameId].receivedGameStates;
                    multiChannel[_gameId].currentState = State.PLAYING;
                    emit NewGameStateSaved(_gameId, _gameState);
                    emit StateChanged(_gameId, 'DISPUTE', 'PLAYING');
                } else {
                    delete multiChannel[_gameId].playerA.hasSubmited;
                    delete multiChannel[_gameId].playerB.hasSubmited;
                    delete multiChannel[_gameId].receivedGameStates;
                    if(block.number + 1 == multiChannel[_gameId].blockNumber + 21) {
                        delete multiChannel[_gameId].blockNumber;
                        multiChannel[_gameId].currentState = State.FINISHED;
                        emit StateChanged(_gameId, 'DISPUTE', 'FINISHED');
                    }
                }
            }
        }
    }

    function transfer(uint _gameId) public checkState(_gameId, State.FINISHED) isPlayer(_gameId) {
        if(multiChannel[_gameId].playerA.isWinner) {
            multiChannel[_gameId].playerA.playerAddress.transfer(multiChannel[_gameId].escrowAmount);
            emit Transfer(_gameId, multiChannel[_gameId].playerA.playerAddress, multiChannel[_gameId].escrowAmount);
        } else if(multiChannel[_gameId].playerB.isWinner) {
            multiChannel[_gameId].playerB.playerAddress.transfer(multiChannel[_gameId].escrowAmount);
            emit Transfer(_gameId, multiChannel[_gameId].playerB.playerAddress, multiChannel[_gameId].escrowAmount);
        } else {
            multiChannel[_gameId].playerA.playerAddress.transfer(multiChannel[_gameId].escrowAmount / 2);
            emit Transfer(_gameId, multiChannel[_gameId].playerA.playerAddress, multiChannel[_gameId].escrowAmount / 2);
            multiChannel[_gameId].playerB.playerAddress.transfer(multiChannel[_gameId].escrowAmount / 2);
            emit Transfer(_gameId, multiChannel[_gameId].playerB.playerAddress, multiChannel[_gameId].escrowAmount / 2);
        }
        delete multiChannel[_gameId];
        emit StateChanged(_gameId, 'FINISHED', 'SETUP');
    }
}