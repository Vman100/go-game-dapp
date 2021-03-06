exports.getByGameId = async (database, GameId) => {
  try {
    const response = await database.ref().child('Games')
    .orderByChild('GameId').equalTo(GameId).once("value")
    return {exists: response.exists(), value: response.val() };
  } catch(err) {
    return err
  }
}

exports.getGamesList = async (database) => {
  try {
    const response = await database.ref('Games').once('value')
    return response.val();
  } catch(err) {
    return err
  }
}

exports.getGameByKey = async (database, key) => {
  try {
    const response = await database.ref('Games/' + key).once('value')
    return {[key]: response.val()};
  } catch (err) {
    return err
  }
}

exports.addNewGame = async (database, gameData) => {
  try {
    const newGamekey = await database.ref().child('Games').push().key;
    const updates = {}
    const path = "Games/" + newGamekey
    updates[path] = { ...gameData }
    await database.ref().update(updates);
    return newGamekey
  } catch(err) {
    return err
  }
}

exports.updateGame = async (database, gamekey, oldGameData, newGameData) => {
  try {
    const updates = {}
    const path = "Games/" + gamekey
    updates[path] = { ...oldGameData, ...newGameData }
    await database.ref().update(updates);
    return gamekey
  } catch(err) {
    return err
  }
}