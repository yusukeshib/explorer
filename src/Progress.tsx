import React, { memo, useCallback } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { action, selector } from './context';
import { createStructuredSelector } from 'reselect';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 48,
    zIndex: theme.zIndex.modal,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(255,255,255,0.65)`,
    padding: theme.spacing(0, 2),
  },
  progress: {
    flex: 1,
  },
  text: {
    userSelect: 'none',
    padding: theme.spacing(0, 2),
  },
  iconButton: {
    padding: 0,
  },
}));

const s = createStructuredSelector({
  syncing: selector.syncing,
  syncCompleted: selector.syncCompleted,
  syncCancelled: selector.syncCancelled,
  fileTotal: selector.fileTotal,
});

const Progress = memo(() => {
  const classes = useStyles();
  const { fileTotal, syncing, syncCancelled, syncCompleted } = useSelector(s);
  const dispatch = useDispatch();

  const onStop = useCallback(() => {
    dispatch(action.cancelSync());
  }, [dispatch]);

  if (!syncing) return null;

  return (
    <div className={classes.container}>
      <LinearProgress
        color="secondary"
        className={classes.progress}
        variant={syncCompleted === 0 ? 'indeterminate' : 'determinate'}
        value={(syncCompleted / fileTotal) * 100}
      />
      <Typography className={classes.text}>
        {syncCompleted} / {fileTotal}
      </Typography>
      <IconButton
        className={classes.iconButton}
        disabled={syncCancelled}
        onClick={onStop}
        color="inherit"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  );
});

Progress.displayName = 'Progress';

export default Progress;
