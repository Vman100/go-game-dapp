import config from './config.js'
import _ from 'lodash'

export const getByUserName = async (UserName) => {
  const url = new URL(`${config.production.backenUrl}/Users`)
  url.search = new URLSearchParams({UserName})
  const response = await fetch(url, {
    method: 'get',
    mode: 'cors',
  })
  const json = await response.json()
  console.log('get by Username ', json)
  return json
}

export const getGamesList = async () => {
  const response = await fetch(`${config.production.backenUrl}/Games`, {
    method: 'get',
    mode: 'cors',
  })
  const json = await response.json()
  if (_.isNull(json)) {
    return json
  } else {
    const list = Object.keys(json).map(key => json[key])
    console.log('get Games List', list)
    return list
  }
}

export const addNewUser = async userData => {
  const rawResponse = await fetch(`${config.production.backenUrl}/Users`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await rawResponse.json()
  console.log('add User', json)
  return json
}

export const addNewGame = async gameData => {
  const rawResponse = await fetch(`${config.production.backenUrl}/Games`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(gameData),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await rawResponse.json()
  console.log('add Game', json)
  return json
}

export const updateGame = async gameData => {
  const rawResponse = await fetch(`${config.production.backenUrl}/Games/${gameData.GameId}`, {
    method: 'PATCH',
    mode: 'cors',
    body: JSON.stringify(gameData),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await rawResponse.json()
  console.log('update Game', json)
  return json
}

export const addFunds = async address => {
  const rawResponse = await fetch(`${config.production.backenUrl}/gitter`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({address}),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await rawResponse.json()
  console.log('add Funds', json)
  return json
}