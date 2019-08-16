import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {CircularProgress, Container, CssBaseline} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progress: {
    margin: theme.spacing(2),
  },
}));

export default function CircularIndeterminate() {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline/>
      <div className={classes.paper}>
        <CircularProgress className={classes.progress} />
      </div>
    </Container>
  );
}