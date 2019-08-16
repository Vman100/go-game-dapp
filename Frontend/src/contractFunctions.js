export const startNewGame = async (gameData, contract) => {
  try {
    const tx = await contract.startNewGame(gameData.GameId,gameData.boardSize,gameData.isWhite)
    const receipt = await tx.wait(2)
    const log = receipt.events.pop().args
    return log
  } catch (error) {
    return error
  }
}

export const joinGame = async (gameId, contract) => {
  try {
    const tx = await contract.joinGame(gameId)
    const receipt = await tx.wait(2)
    const log = receipt.events.pop().args
    return log
  } catch (error) {
    return error
  }
}