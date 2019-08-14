import React from 'react';
import {connect} from 'react-redux'
import { 
  CssBaseline, 
  Container, 
  RadioGroup, 
  Radio, 
  Button,
  ButtonGroup,
  FormControlLabel, 
  FormControl, 
  FormLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

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
  button: {
    margin: theme.spacing(3, 0, 2),
  },
  formControl: {
    margin: theme.spacing(3),
  },
  group: {
    margin: theme.spacing(1, 0),
  },
}));

function GameSelect(props) {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    showNewGame: false,
    showJoinGame: false,
    color: 'white',
    boardSize: '5',
    GameId: '1',
    GamesList: [{ GameId: '1'}]
  });

  function handleChange(event, value) {
    setValues({...values, [event.target.name]: value});
  }

  const handleClick = event => {
    event.preventDefault()
    if(event.currentTarget.name === "NewGame") {
      setValues({...values, showNewGame: true, showJoinGame: false})
    }
    if(event.currentTarget.name === "JoinGame") {
      setValues({...values, showNewGame: false, showJoinGame: true })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const { wallet, GamesList} = props
    const {color, boardSize} = values
    if(values.showNewGame) {
      let GameId = GamesList ? GamesList[GamesList.length - 1].GameId + 1 : 0
      let gameData = {
        color,
        boardSize,
        GameId
      }
    }
    if(values.showJoinGame) {
      
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <form className={classes.form} noValidate onSubmit={handleSubmit} >
          <ButtonGroup 
            fullWidth 
            variant="contained"
            color="primary"
            className={classes.button}
            aria-label="full-width contained primary button group">
            <Button type="button" name="NewGame" onClick={handleClick}>
              New Game
            </Button>
            <Button type="button" name="JoinGame" onClick={handleClick}>
              Join Game
            </Button>
          </ButtonGroup>
          {values.showNewGame && (<div>        
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Color</FormLabel>
              <RadioGroup
                aria-label="color"
                name="color"
                className={classes.group}
                value={values.color}
                onChange={handleChange}>
                  <FormControlLabel value="white" control={<Radio />} label="White" />
                  <FormControlLabel value="black" control={<Radio />} label="Black" />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Board Size</FormLabel>
              <RadioGroup
                aria-label="boardSize"
                name="boardSize"
                className={classes.group}
                value={values.boardSize}
                onChange={handleChange}>
                {props.availableSizes.map((choices, index) => 
                  <FormControlLabel key={index} value={choices} control={<Radio />} label={choices} />
                )}
              </RadioGroup>
            </FormControl>
            <Button 
              type="submit"
              fullWidth 
              variant="contained" 
              color="secondary" 
              className={classes.submit}>
                Submit NewGame Options
            </Button>
          </div>)}
          {values.showJoinGame && (<div>
            {!values.GamesList && (<p>No Game Available, please start new Game</p>)}
            {values.GamesList && (<div>
              <FormControl component="fieldset" className={classes.formControl} >
                <FormLabel component="legend">Games By Id</FormLabel>
                <RadioGroup
                  aria-label="GameId"
                  name="GameId"
                  className={classes.group}
                  value={values.GameId}
                  onChange={handleChange}> 
                  {values.GamesList.map(key => 
                    <FormControlLabel key={key.GameId} value={key.GameId} control={<Radio />} label={key.GameId} />
                  )}
                </RadioGroup>
                <Button 
                  type="submit"
                  fullWidth 
                  variant="contained" 
                  color="secondary" 
                  className={classes.submit}>
                    Submit JoinGame Options
                </Button>
              </FormControl>
            </div>)}
          </div>)}
        </form>
      </div>
    </Container>
  );

}

const mapStateToProps = state => {
  const { wallet, GamesList, availableSizes } = state.user
  return {
    wallet,
    GamesList,
    availableSizes
  }
}

export default connect(mapStateToProps)(GameSelect)