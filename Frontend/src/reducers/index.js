import { combineReducers } from 'redux'
import {
  SET_LOADING,
  SET_EMAIL,
  SET_WALLET,
  SET_ISWALLET,
  SET_PASSWORD,
  SET_BUTTONNAME,
  SET_GAMESLIST,
  SET_CONTRACT,
  SET_GAMEID
} from '../actions'


const user = (state = {
  isLoading: true,
  wallet: undefined,
  isWallet: false,
  contract: undefined,
  email: '',
  password: '',
  DAPP_STORAGE_KEY: 'SIGNTX',
  buttonName: 'Sign Up',
  GamesList: undefined,
  gameId: undefined,
  availableSizes: ['5','6','7','8','9','11','13','15','19']
}, action) => {
  switch (action.type) {
    case SET_LOADING:
        return {
          ...state,
          isLoading: action.isLoading
        }
    case SET_WALLET:
      return {
        ...state,
        wallet: action.wallet
      }
    case SET_ISWALLET:
      return {
        ...state,
        isWallet: action.isWallet
      }
    case SET_EMAIL:
        return {
          ...state,
          email: action.email
        }
    case SET_PASSWORD:
      return {
        ...state,
        password: action.password
      }
    case SET_BUTTONNAME:
        return {
          ...state,
          buttonName: action.buttonName
        }
    case SET_GAMESLIST:
      return {
        ...state,
        GamesList: action.GamesList
      }
    case SET_CONTRACT:
      return {
        ...state,
        contract: action.contract
      }
    case SET_GAMEID:
      return {
        ...state,
        gameId: action.gameId
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
    user,
})

export default rootReducer