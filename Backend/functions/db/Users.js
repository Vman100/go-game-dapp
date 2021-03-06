exports.getByUserName = async (database, UserName) => {
  try {
    let value
    const response = await database.ref().child('Users')
    .orderByChild('UserName').equalTo(UserName).once("value")
    response.forEach((child) => { value = child.val()})
    return {exists: response.exists(), value };
  } catch(err) {
    return err
  }
}

exports.getUserList = async (database) => {
  try {
    const response = await database.ref('Users').once('value')
    return response.val();
  } catch(err) {
    return err
  }
}

exports.getUserByKey = async (database, key) => {
  try {
    const response = await database.ref('Users/' + key).once('value')
    return {[key]: response.val()};
  } catch (err) {
    return err
  }
}

exports.addNewUser = async (database, userData) => {
  try {
    const newUserkey = await database.ref().child('Users').push().key;
    const updates = {}
    const path = "Users/" + newUserkey
    updates[path] = { ...userData }
    await database.ref().update(updates);
    return newUserkey
  } catch(err) {
    return err
  }
}