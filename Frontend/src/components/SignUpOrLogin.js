import React from 'react';
import {connect} from 'react-redux'
import { keccak512 } from 'js-sha3';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import jc from 'json-cycle';
import { CssBaseline, Container, TextField, Button, InputAdornment, IconButton } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import {setPassword, setEmail, setWallet, setContract } from '../actions'
import {getByUserName, addNewUser, addFunds} from '../apis'
import contractinfo from '../contracts/goGameStateChannel'

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function SignUpOrLogin(props) {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    showPassword: false,
    helperText: '',
    error: false
  });

  const handleChange = prop => event => {
    if(prop === 'password') {
      props.dispatch(setPassword(event.target.value))
    }
    if(prop === 'email') {
      props.dispatch(setEmail(event.target.value))
    } 
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  async function handleSubmit(event) {
    event.preventDefault()
    const {isWallet, email, password, DAPP_STORAGE_KEY, dispatch } = props
    const hashKey = keccak512(password)
    const userData = {
      UserName: email,
      passwordHash: hashKey
    }
    const checkUserName = await getByUserName(userData.UserName)
    const storageObj = window.localStorage
    if(isWallet) {
      // Decryption
      if(checkUserName.exists && userData.passwordHash === checkUserName.value.passwordHash) {
        setValues({...values, helperText: '', error: false})
        const provider = await ethers.getDefaultProvider('kovan')
        const decycleEncryptedStore = storageObj.getItem(DAPP_STORAGE_KEY)
        const cyclicCipher = jc.retrocycle(JSON.parse(decycleEncryptedStore))
        const bytes = CryptoJS.AES.decrypt(cyclicCipher, hashKey)
        const plainText = bytes.toString(CryptoJS.enc.Utf8)
        const wallet = JSON.parse(plainText)
        const orignalWallet = new ethers.Wallet(wallet.privateKey, provider)
        const contract = new ethers.Contract(contractinfo.address, contractinfo.abi, orignalWallet)
        dispatch(setWallet(orignalWallet))
        dispatch(setContract(contract))
      } else {
        setValues({...values, helperText: 'username/password is incorrect', error: true})
      }
    } else {
      await addNewUser(userData)
      const { mnemonic } = ethers.Wallet.createRandom()
      const orignalWallet = new ethers.Wallet.fromMnemonic(mnemonic)
      const wallet = {
        address: orignalWallet.address,
        privateKey: orignalWallet.privateKey,
        path: orignalWallet.path,
        mnemonic: orignalWallet.mnemonic
      }
      dispatch(setWallet(orignalWallet))
      await addFunds(wallet.address)
      // Encryption
      const encryptedStore = CryptoJS.AES.encrypt(JSON.stringify(wallet), hashKey)
      const decycleEncrytedStore = JSON.stringify(jc.decycle(encryptedStore))
      storageObj.setItem(DAPP_STORAGE_KEY, decycleEncrytedStore)
    }
  }
  
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            helperText={values.helperText}
            error={values.error}
            value={props.email}
            onChange={handleChange('email')}
            autoComplete="email"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="password"
            name="password"
            label="Password"
            helperText={values.helperText}
            error={values.error}
            type={values.showPassword ? 'text' : 'password'}
            value={props.password}
            onChange={handleChange('password')}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {values.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            {props.buttonName}
          </Button>
        </form>
      </div>
    </Container>
  );
}

const mapStateToProps = state => {
  const { password, email, isWallet, buttonName, DAPP_STORAGE_KEY } = state.user
  return {
    password,
    email,
    isWallet,
    buttonName,
    DAPP_STORAGE_KEY
  }
}

export default connect(mapStateToProps)(SignUpOrLogin)