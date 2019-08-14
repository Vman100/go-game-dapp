export const SET_LOADING = 'SET_LOADING'
export const SET_WALLET = 'SET_WALLET'
export const SET_ISWALLET = 'SET_ISWALLET'
export const SET_EMAIL = 'SET_EMAIL'
export const SET_PASSWORD = 'SET_PASSWORD'
export const SET_BUTTONNAME = 'SET_BUTTONNAME'
export const SET_GAMESLIST = 'SET_GAMESLIST';

export const setLoading = (bool) => ({
  type: SET_LOADING,
  isLoading: bool
})

export const setWallet = (wallet) => ({
  type: SET_WALLET,
  wallet
})

export const setIsWallet = (bool) => ({
  type: SET_ISWALLET,
  isWallet: bool
})

export const setEmail = (email) => ({
  type: SET_EMAIL,
  email
})

export const setPassword = (password) => ({
  type: SET_PASSWORD,
  password
})

export const setButtonName = (buttonName) => ({
  type: SET_BUTTONNAME,
  buttonName
})

export const setGamesList = (GamesList) => ({
  type: SET_GAMESLIST,
  GamesList
})

// export const requestGamesList =  => ({
//   type: REQUEST_GAMESLIST,
//   GameId
// })

// export const receiveGamesList = (json) => ({
//   type: RECEIVE_GAMESLIST,
//   posts: json.data.children.map(child => child.data),
//   receivedAt: Date.now()
// })

// export const fetchPosts = subreddit => dispatch => {
//   dispatch(requestPosts(subreddit))
//   return fetch(`https://www.reddit.com/r/${subreddit}.json`)
//     .then(response => response.json())
//     .then(json => dispatch(receivePosts(json)))
// }