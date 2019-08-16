import React from 'react';
import {connect} from 'react-redux'
import {setIsWallet, setButtonName, setGamesList } from './actions'
import SignUpOrLogin from './components/SignUpOrLogin.js'
import GameSelect from './components/GameSelect.js'
import { getGamesList } from './apis';
import _ from 'lodash'



class App extends React.Component {

  async componentDidMount() {
    const { dispatch, DAPP_STORAGE_KEY } = this.props
    const wallet = window.localStorage.getItem(DAPP_STORAGE_KEY)
    const isWallet = wallet === null || wallet === undefined ? false : true
    if(isWallet) {
      dispatch(setButtonName('Sign In'))
    }
    dispatch(setIsWallet(isWallet))
    const GamesList = await getGamesList()
    if(!_.isNull(GamesList)) {
      dispatch(setGamesList(GamesList))
    } 
  }

  render() {
    const { wallet, gameId } = this.props
    return (
      <div>
        {!wallet && (<SignUpOrLogin />)}
        {wallet && !gameId && (<GameSelect />)}
        {wallet && gameId && (<h3>{wallet.address} and {gameId}</h3>)}
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { wallet, gameId, buttonName, DAPP_STORAGE_KEY } = state.user
  return {
    wallet,
    gameId,
    buttonName,
    DAPP_STORAGE_KEY
  }
}

export default connect(mapStateToProps)(App)
