import React, { useEffect, useCallback, memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selector, action } from './context';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  panel: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    maxWidth: 480,
  },
  sep: {
    height: theme.spacing(2),
  },
}));

const Signin = memo(() => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const signedIn = useSelector(selector.signedIn);
  const history = useHistory();

  const onSignin = useCallback(() => {
    const param = new URLSearchParams({
      client_id: process.env.CLIENT_ID ?? '',
      redirect_uri: process.env.REDIRECTURI ?? '',
      response_type: 'token',
    });
    const href = `https://www.dropbox.com/oauth2/authorize?${param.toString()}`;
    window.location.href = href;
  }, [dispatch]);

  // access_token
  useEffect(() => {
    const param = new URLSearchParams(location.hash.slice(2));
    const code = param.get('access_token');
    if (code) {
      dispatch(action.signIn(code));
      history.replace('/');
    }
  }, []);

  if (signedIn) return null;

  return (
    <div className={classes.container}>
      <div className={classes.panel}>
        <Typography variant="h6">Welcome to Dropbox photo viewer</Typography>
        <div className={classes.sep} />
        <Typography>
          This is a photo viewer to explore your photos in your Dropbox account
          easily. We store only one file(dphoto.json) in your Dropbox drive to
          cache your photo data.
        </Typography>
        <div className={classes.sep} />
        <Button variant="contained" onClick={onSignin} color="primary">
          Sign in with Dropbox
        </Button>
      </div>
    </div>
  );
});

Signin.displayName = 'Signin';

export default Signin;
