require('dotenv').config()
const functions = require('firebase-functions');
const admin = require('firebase-admin')
const cors = require('cors')
const express = require('express')
const usersSite = require('./db/Users.js')
const gamesSite = require('./db/Games.js')
const serviceAccount = require("../go-game-dapp-firebase-adminsdk.json");

const usersEndpoint = express()
const gamesEndpoint = express()
usersEndpoint.use(cors({ origin: true }));
gamesEndpoint.use(cors({ origin: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://go-game-dapp.firebaseio.com"
});

const prepareData = (data, method) => {
  let params = []
  if(method === 'addUser') {
    params.push('UserName', 'passwordHash')
  } else if(method === 'checkUser') {
    params.push('UserName')
  } else if(method === 'addGame') {
    params.push('GameId')
  }

  for (let key in data) {
    if (data[key] === '') {
      delete data[key]
    } else if(!params.includes(key)){
      delete data[key]
    } else {
      params.splice(params.indexOf(key), 1)
    }
  }
  
  data["length"] = Object.keys(data).length
  data['missingParams'] = params

  return data
}

const getByUserName = async (req, res) => {
  const userData = prepareData(req.query, 'checkUser')
  if(userData.length === 1) {
    try {
      const user = await usersSite.getByUserName(admin.database(), userData.UserName)
      return res.status(200).json(user)
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(400).json(`these Parameters are missing or empty ${userData.missingParams}`)
  }
}

const addUser = async (req, res) => {
    try {
      const userData = prepareData(req.body, "addUser")
      if(userData.length === 2) {
        delete userData['missingParams']
        delete userData['length']
        const user = await usersSite.getByUserName(admin.database(), userData.UserName)
        if(!user.exists){
          const newUserkey = await usersSite.addNewUser(admin.database(), userData)
          const newUser = await usersSite.getUserByKey(admin.database(), newUserkey)
          return res.status(200).json(newUser)
        } else {
          return res.status(400).json(`User with username ${userData.UserName} already exists`)
        }
      } else {
        return res.status(400).json(`these Parameters are missing or empty ${userData.missingParams}`)
      }
    } catch (err) {
      return res.status(500).json(err)
    }
}

const getGamesList = async (req, res) => {
  try {
    const games = await gamesSite.getGamesList(admin.database())
    return res.status(200).json(games)
  } catch (err) {
    return res.status(500).json(err)
  }
}

const addGame = async (req, res) => {
    try {
      const gameData = prepareData(req.body, "addGame")
      if(gameData.length === 1) {
        delete gameData['missingParams']
        delete gameData['length']
        const game = await gamesSite.getByGameId(admin.database(), gameData.GameId)
        if(!game.exists){
          const newGamekey = await gamesSite.addNewGame(admin.database(), gameData)
          const newGame = await gamesSite.getGameByKey(admin.database(), newGamekey)
          return res.status(200).json(newGame)
        } else {
          return res.status(400).json(`The game with GameId ${gameData.GameId} already exists`)
        }
      } else {
        return res.status(400).json(`these Parameters are missing or empty ${gameData.missingParams}`)
      }
    } catch (err) {
      return res.status(500).json(err)
    }
}

usersEndpoint.get('/', getByUserName)
usersEndpoint.post('/', addUser)

gamesEndpoint.get('/', getGamesList)
gamesEndpoint.post('/', addGame)

exports.Users = functions.https.onRequest(usersEndpoint)
exports.Games = functions.https.onRequest(gamesEndpoint)
