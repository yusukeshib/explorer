import React, { useCallback, useState, memo } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MoreIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { selector, action } from './context';
import { createStructuredSelector } from 'reselect';
import { Beforeunload } from 'react-beforeunload';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    padding: theme.spacing(0, 1, 0, 2),
  },
  title: {
    userSelect: 'none',
    flex: 1,
  },
}));

const s = createStructuredSelector({
  saving: selector.saving,
  syncing: selector.syncing,
  signedIn: selector.signedIn,
});

const ToolbarComponent = memo(() => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const dispatch = useDispatch();
  const { signedIn, saving, syncing } = useSelector(s);

  const onOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const onClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const onSignOut = useCallback(() => {
    dispatch(action.signOut());
    setAnchorEl(null);
  }, [dispatch]);

  const onSync = useCallback(() => {
    dispatch(action.sync());
    setAnchorEl(null);
  }, [dispatch]);

  if (!signedIn) return null;

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar} variant="dense">
        <Typography noWrap className={classes.title}>
          Photo finder
        </Typography>
        <IconButton onClick={onOpen} color="inherit">
          <MoreIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
          <MenuItem disabled={syncing} onClick={onSync}>
            Sync with your dropbox
          </MenuItem>
          <MenuItem onClick={onSignOut}>Sign out</MenuItem>
        </Menu>
      </Toolbar>
      {saving && <Beforeunload onBeforeunload={() => 'Syncing...'} />}
    </AppBar>
  );
});

ToolbarComponent.displayName = 'Toolbar';

export default ToolbarComponent;
